import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { EvidenceReport } from '@/components/EvidenceReport'
import type { Case, Evidence, AuditLog } from '@/types'
import React from 'react'

export async function GET(
  _request: Request,
  { params }: { params: { caseId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: caseData } = await supabase
    .from('cases')
    .select('*, landlord:profiles!cases_landlord_id_fkey(*), tenant:profiles!cases_tenant_id_fkey(*)')
    .eq('id', params.caseId)
    .single()

  if (!caseData) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const c = caseData as Case

  if (c.landlord_id !== user.id && c.tenant_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch evidence with signed URLs
  const { data: evidenceRaw } = await supabase
    .from('evidence')
    .select('*, uploader:profiles!evidence_uploaded_by_fkey(*)')
    .eq('case_id', params.caseId)
    .order('uploaded_at', { ascending: true })

  const evidence = await Promise.all(
    ((evidenceRaw as Evidence[]) ?? []).map(async (ev) => {
      const { data: signed } = await supabase.storage
        .from('inspections')
        .createSignedUrl(ev.storage_path, 3600)
      return { ...ev, signed_url: signed?.signedUrl }
    })
  )

  // Fetch audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles!audit_logs_user_id_fkey(*)')
    .eq('case_id', params.caseId)
    .order('created_at', { ascending: true })

  // Log PDF export event
  const serviceClient = createServiceClient()
  await serviceClient.from('audit_logs').insert({
    case_id: params.caseId,
    user_id: user.id,
    event_type: 'pdf_exported',
    metadata: { exported_by: user.email },
  })

  const pdfBuffer = await renderToBuffer(
    React.createElement(EvidenceReport, {
      caseData: c,
      evidence: evidence as Evidence[],
      auditLogs: (auditLogs as AuditLog[]) ?? [],
      generatedAt: new Date().toISOString(),
    })
  )

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tenantvault-case-${params.caseId.slice(0, 8)}.pdf"`,
    },
  })
}
