import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TenantJoinForm from '@/components/TenantJoinForm'

interface Props {
  params: { token: string }
}

export default async function InvitePage({ params }: Props) {
  const supabase = await createClient()

  // Look up case by invite token
  const { data: caseData, error } = await supabase
    .from('cases')
    .select('id, address, unit_number, move_out_date, status, tenant_id')
    .eq('invite_token', params.token)
    .single()

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="vault-card max-w-md w-full text-center">
          <h2 className="font-display text-2xl font-bold text-vault-snow mb-2">Invalid invite</h2>
          <p className="font-body text-sm text-vault-ash">
            This invite link is invalid or has expired. Contact your landlord for a new link.
          </p>
        </div>
      </div>
    )
  }

  if (caseData.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="vault-card max-w-md w-full text-center">
          <h2 className="font-display text-2xl font-bold text-vault-snow mb-2">Case closed</h2>
          <p className="font-body text-sm text-vault-ash">
            This inspection case has been closed and is no longer accepting evidence.
          </p>
        </div>
      </div>
    )
  }

  // Check if already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (user && caseData.tenant_id === user.id) {
    redirect(`/cases/${caseData.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 w-fit mx-auto">
          <div className="w-9 h-9 rounded-lg bg-vault-gold flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="10" rx="2" stroke="#0D0F12" strokeWidth="1.5"/>
              <path d="M5 12v2M11 12v2M8 6v4M6 8h4" stroke="#0D0F12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-vault-snow">TenantVault</span>
        </div>

        {/* Case info */}
        <div className="vault-card border-vault-gold/30 mb-6">
          <p className="font-mono text-xs text-vault-gold uppercase tracking-widest mb-3">Inspection case</p>
          <h2 className="font-display text-xl font-bold text-vault-snow mb-1">
            {caseData.address}
            {caseData.unit_number ? ` · Unit ${caseData.unit_number}` : ''}
          </h2>
          <p className="font-mono text-xs text-vault-ash">
            Move-out: {new Date(caseData.move_out_date).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>

        <TenantJoinForm caseId={caseData.id} token={params.token} />
      </div>
    </div>
  )
}
