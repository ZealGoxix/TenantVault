import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Case, Evidence, AuditLog } from '@/types'
import EvidenceUploader from '@/components/EvidenceUploader'
import EvidenceGallery from '@/components/EvidenceGallery'
import AuditTimeline from '@/components/AuditTimeline'
import InviteLinkBox from '@/components/InviteLinkBox'
import CaseActions from '@/components/CaseActions'

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*, landlord:profiles!cases_landlord_id_fkey(*), tenant:profiles!cases_tenant_id_fkey(*)')
    .eq('id', params.id)
    .single()

  if (error || !caseData) notFound()
  const c = caseData as Case

  // Verify access
  if (c.landlord_id !== user.id && c.tenant_id !== user.id) {
    redirect('/dashboard')
  }

  const isLandlord = c.landlord_id === user.id
  const isClosed = c.status === 'closed'

  // Fetch evidence with signed URLs
  const { data: evidenceRaw } = await supabase
    .from('evidence')
    .select('*, uploader:profiles!evidence_uploaded_by_fkey(*)')
    .eq('case_id', params.id)
    .order('uploaded_at', { ascending: true })

  const evidence = await Promise.all(
    ((evidenceRaw as Evidence[]) ?? []).map(async (ev) => {
      const { data: signedData } = await supabase.storage
        .from('inspections')
        .createSignedUrl(ev.storage_path, 3600)
      return { ...ev, signed_url: signedData?.signedUrl }
    })
  )

  const landlordEvidence = evidence.filter(ev => ev.uploaded_by === c.landlord_id)
  const tenantEvidence   = evidence.filter(ev => ev.uploaded_by === c.tenant_id)

  // Fetch audit log
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*, user:profiles!audit_logs_user_id_fkey(*)')
    .eq('case_id', params.id)
    .order('created_at', { ascending: false })

  const STATUS_CHIP: Record<string, string> = {
    draft:  'bg-vault-mist/30 text-vault-ash',
    active: 'bg-vault-emerald/20 text-emerald-400',
    closed: 'bg-vault-mist/20 text-vault-silver',
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-vault-steel/40 px-8 py-5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-mono text-xs text-vault-ash hover:text-vault-gold transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <span className={`font-mono text-xs px-2 py-1 rounded-full ${STATUS_CHIP[c.status] ?? STATUS_CHIP.draft}`}>
            {c.status}
          </span>
          {isLandlord && (
            <CaseActions caseId={c.id} status={c.status} />
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-10">
        {/* Case header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-vault-snow mb-1">
            {c.address}{c.unit_number ? ` · Unit ${c.unit_number}` : ''}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
            <span className="font-mono text-xs text-vault-ash">
              Move-out: {new Date(c.move_out_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="font-mono text-xs text-vault-ash">
              Landlord: {c.landlord?.full_name ?? '—'}
            </span>
            <span className="font-mono text-xs text-vault-ash">
              Tenant: {c.tenant?.full_name ?? 'Not yet joined'}
            </span>
            <span className="font-mono text-xs text-vault-mist">
              Case ID: {c.id.slice(0, 8)}…
            </span>
          </div>
        </div>

        <div className="gold-rule mb-8"/>

        {/* Invite link — landlord only, not closed */}
        {isLandlord && !isClosed && (
          <div className="mb-8">
            <InviteLinkBox token={c.invite_token} />
          </div>
        )}

        {/* Upload — if not closed */}
        {!isClosed && (
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold text-vault-snow mb-4">Upload evidence</h2>
            <EvidenceUploader caseId={c.id} userId={user.id} />
          </div>
        )}

        {/* Evidence galleries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="font-display text-xl font-semibold text-vault-snow mb-4 flex items-center gap-2">
              <span className="text-vault-gold">🏠</span> Landlord evidence
              <span className="font-mono text-xs text-vault-ash ml-1">({landlordEvidence.length})</span>
            </h2>
            <EvidenceGallery evidence={landlordEvidence} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-vault-snow mb-4 flex items-center gap-2">
              <span className="text-vault-gold">🔑</span> Tenant evidence
              <span className="font-mono text-xs text-vault-ash ml-1">({tenantEvidence.length})</span>
            </h2>
            <EvidenceGallery evidence={tenantEvidence} />
          </div>
        </div>

        {/* Audit log + PDF export */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-semibold text-vault-snow mb-4">Audit log</h2>
            <AuditTimeline logs={(auditLogs as AuditLog[]) ?? []} />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-vault-snow mb-4">Export</h2>
            <div className="vault-card">
              <p className="font-body text-sm text-vault-ash mb-4 leading-relaxed">
                Generate a complete court-ready PDF with all evidence, captions, timestamps, and the full audit log.
              </p>
              <a
                href={`/api/pdf/${c.id}`}
                target="_blank"
                className="vault-btn-primary w-full text-center block"
              >
                Download PDF report →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
