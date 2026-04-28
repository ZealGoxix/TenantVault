import { redirect } from 'next/navigation'
import Link from 'next/link'
import TenantJoinForm from '@/components/TenantJoinForm'

interface Props {
  params: { token: string }
}

async function getCaseByToken(token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/invite/validate?token=${token}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return null
  return res.json()
}

export default async function InvitePage({ params }: Props) {
  const caseData = await getCaseByToken(params.token)

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0D0F12' }}>
        <div className="vault-card max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F3F4F6' }}>Invalid invite</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            This invite link is invalid or has expired. Contact your landlord for a new link.
          </p>
        </div>
      </div>
    )
  }

  if (caseData.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0D0F12' }}>
        <div className="vault-card max-w-md w-full text-center">
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F3F4F6' }}>Case closed</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            This inspection case has been closed and is no longer accepting evidence.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#0D0F12' }}>
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-10 w-fit mx-auto">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#C9A84C' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="10" rx="2" stroke="#0D0F12" strokeWidth="1.5"/>
              <path d="M5 12v2M11 12v2M8 6v4M6 8h4" stroke="#0D0F12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold" style={{ color: '#F3F4F6' }}>TenantVault</span>
        </Link>

        <div className="vault-card mb-6" style={{ borderColor: 'rgba(201,168,76,0.3)' }}>
          <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: '#C9A84C' }}>
            Inspection case
          </p>
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#F3F4F6' }}>
            {caseData.address}{caseData.unit_number ? ` · Unit ${caseData.unit_number}` : ''}
          </h2>
          <p className="font-mono text-xs" style={{ color: '#6B7280' }}>
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