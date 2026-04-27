import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer, Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'
import type { Case, Evidence, AuditLog } from '@/types'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#1A1D23',
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 12,
    marginBottom: 16,
    borderBottom: '1.5pt solid #C9A84C',
  },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#0D0F12', letterSpacing: 1 },
  logoSub: { fontSize: 7, color: '#6B7280', letterSpacing: 2, marginTop: 2 },
  metaBlock: { alignItems: 'flex-end' },
  metaLine: { fontSize: 7, color: '#6B7280', marginBottom: 1 },
  metaVal: { fontSize: 7, color: '#1A1D23', fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 11, fontWeight: 'bold', color: '#0D0F12',
    marginTop: 20, marginBottom: 8, paddingBottom: 4,
    borderBottom: '0.5pt solid #E5E7EB',
  },
  caseGrid: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  caseCell: { flex: 1 },
  caseLabel: { fontSize: 7, color: '#9CA3AF', marginBottom: 2 },
  caseValue: { fontSize: 9, color: '#1A1D23' },
  evidenceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  evidenceItem: {
    width: '47%', marginBottom: 10,
    border: '0.5pt solid #E5E7EB', borderRadius: 4, overflow: 'hidden',
  },
  evidenceImg: { width: '100%', height: 120, objectFit: 'cover' },
  evidenceMeta: { padding: 6, backgroundColor: '#F9FAFB' },
  evidenceCaption: { fontSize: 8, color: '#374151', marginBottom: 3, lineHeight: 1.4 },
  evidenceAttrib: { fontSize: 7, color: '#9CA3AF' },
  auditRow: {
    flexDirection: 'row', paddingVertical: 5,
    borderBottom: '0.5pt solid #F3F4F6', gap: 8,
  },
  auditDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C9A84C', marginTop: 2, flexShrink: 0 },
  auditEvent: { fontSize: 8, color: '#1A1D23', fontWeight: 'bold', marginBottom: 1 },
  auditMeta: { fontSize: 7, color: '#6B7280' },
  footer: {
    position: 'absolute', bottom: 24, left: 48, right: 48,
    flexDirection: 'row', justifyContent: 'space-between',
    borderTop: '0.5pt solid #E5E7EB', paddingTop: 6,
  },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

const EVENT_LABELS: Record<string, string> = {
  case_created: 'Case created',
  invite_sent: 'Invite sent',
  invite_accepted: 'Tenant joined',
  photo_uploaded: 'Photo uploaded',
  pdf_exported: 'PDF exported',
  case_closed: 'Case closed',
}

function buildPdf(c: Case, evidence: Evidence[], auditLogs: AuditLog[], generatedAt: string) {
  const landlordEvidence = evidence.filter(ev => ev.uploaded_by === c.landlord_id)
  const tenantEvidence   = evidence.filter(ev => ev.uploaded_by === c.tenant_id)
  const genDate = new Date(generatedAt).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })

  return (
    <Document title={`TenantVault Evidence Report — ${c.address}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.logoText}>TenantVault</Text>
            <Text style={styles.logoSub}>EVIDENCE REPORT</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLine}>Generated</Text>
            <Text style={styles.metaVal}>{genDate}</Text>
            <Text style={[styles.metaLine, { marginTop: 4 }]}>Case ID</Text>
            <Text style={styles.metaVal}>{c.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Case Details</Text>
        <View style={styles.caseGrid}>
          <View style={styles.caseCell}>
            <Text style={styles.caseLabel}>PROPERTY ADDRESS</Text>
            <Text style={styles.caseValue}>{c.address}{c.unit_number ? ` · Unit ${c.unit_number}` : ''}</Text>
          </View>
          <View style={styles.caseCell}>
            <Text style={styles.caseLabel}>MOVE-OUT DATE</Text>
            <Text style={styles.caseValue}>{new Date(c.move_out_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
          </View>
        </View>
        <View style={[styles.caseGrid, { marginTop: 8 }]}>
          <View style={styles.caseCell}>
            <Text style={styles.caseLabel}>LANDLORD</Text>
            <Text style={styles.caseValue}>{c.landlord?.full_name ?? '—'}</Text>
          </View>
          <View style={styles.caseCell}>
            <Text style={styles.caseLabel}>TENANT</Text>
            <Text style={styles.caseValue}>{c.tenant?.full_name ?? 'Not joined'}</Text>
          </View>
          <View style={styles.caseCell}>
            <Text style={styles.caseLabel}>STATUS</Text>
            <Text style={styles.caseValue}>{c.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Landlord Evidence ({landlordEvidence.length} photos)</Text>
        {landlordEvidence.length === 0
          ? <Text style={{ fontSize: 8, color: '#9CA3AF' }}>No photos uploaded by landlord.</Text>
          : <View style={styles.evidenceGrid}>
              {landlordEvidence.map(ev => (
                <View key={ev.id} style={styles.evidenceItem}>
                  {ev.signed_url && <Image src={ev.signed_url} style={styles.evidenceImg}/>}
                  <View style={styles.evidenceMeta}>
                    {ev.caption && <Text style={styles.evidenceCaption}>{ev.caption}</Text>}
                    <Text style={styles.evidenceAttrib}>
                      {ev.uploader?.full_name} · {new Date(ev.uploaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
        }

        <Text style={styles.sectionTitle}>Tenant Evidence ({tenantEvidence.length} photos)</Text>
        {tenantEvidence.length === 0
          ? <Text style={{ fontSize: 8, color: '#9CA3AF' }}>No photos uploaded by tenant.</Text>
          : <View style={styles.evidenceGrid}>
              {tenantEvidence.map(ev => (
                <View key={ev.id} style={styles.evidenceItem}>
                  {ev.signed_url && <Image src={ev.signed_url} style={styles.evidenceImg}/>}
                  <View style={styles.evidenceMeta}>
                    {ev.caption && <Text style={styles.evidenceCaption}>{ev.caption}</Text>}
                    <Text style={styles.evidenceAttrib}>
                      {ev.uploader?.full_name} · {new Date(ev.uploaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
        }

        <Text style={styles.sectionTitle}>Audit Log ({auditLogs.length} events)</Text>
        {auditLogs.map((log, i) => (
          <View key={log.id} style={styles.auditRow}>
            <View style={[styles.auditDot, i !== 0 ? { backgroundColor: '#D1D5DB' } : {}]}/>
            <View>
              <Text style={styles.auditEvent}>{EVENT_LABELS[log.event_type] ?? log.event_type}</Text>
              <Text style={styles.auditMeta}>
                {log.user?.full_name ?? 'System'} · {new Date(log.created_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit',
                })}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>TenantVault · Tamper-evident evidence platform</Text>
          <Text style={styles.footerText}>Case {c.id.slice(0, 8).toUpperCase()} · Generated {genDate}</Text>
        </View>
      </Page>
    </Document>
  )
}

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

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles!audit_logs_user_id_fkey(*)')
    .eq('case_id', params.caseId)
    .order('created_at', { ascending: true })

  const serviceClient = createServiceClient()
  await serviceClient.from('audit_logs').insert({
    case_id: params.caseId,
    user_id: user.id,
    event_type: 'pdf_exported',
    metadata: { exported_by: user.email },
  })

  const generatedAt = new Date().toISOString()
  const pdfBuffer = await renderToBuffer(
    buildPdf(c, evidence as Evidence[], (auditLogs as AuditLog[]) ?? [], generatedAt)
  )

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tenantvault-case-${params.caseId.slice(0, 8)}.pdf"`,
    },
  })
}