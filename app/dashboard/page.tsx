import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Case } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  draft:  'rgba(58,62,74,0.3)',
  active: 'rgba(5,150,105,0.2)',
  closed: 'rgba(58,62,74,0.2)',
}
const STATUS_TEXT: Record<string, string> = {
  draft:  '#6B7280',
  active: '#34D399',
  closed: '#9CA3AF',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isLandlord = profile?.role === 'landlord'

  // Landlords see cases they own, tenants see cases they're linked to
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq(isLandlord ? 'landlord_id' : 'tenant_id', user.id)
    .order('created_at', { ascending: false })

  const caseList = (cases as Case[]) ?? []

  return (
    <div className="min-h-screen" style={{ background: '#0D0F12' }}>
      <header className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(37,40,48,0.6)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#C9A84C' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="10" rx="2" stroke="#0D0F12" strokeWidth="1.5"/>
              <path d="M5 12v2M11 12v2M8 6v4M6 8h4" stroke="#0D0F12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold" style={{ color: '#F3F4F6' }}>TenantVault</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm hidden sm:block" style={{ color: '#6B7280' }}>
              {profile?.full_name ?? user.email}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-full"
              style={{ background: isLandlord ? 'rgba(201,168,76,0.15)' : 'rgba(14,165,233,0.15)',
                       color: isLandlord ? '#C9A84C' : '#38BDF8' }}>
              {isLandlord ? 'landlord' : 'tenant'}
            </span>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-xs transition-colors" style={{ color: '#3A3E4A' }}>Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: '#F3F4F6' }}>
              {isLandlord ? 'Inspection Cases' : 'My Cases'}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
              {caseList.length === 0 ? 'No cases yet' : `${caseList.length} case${caseList.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {isLandlord && (
            <Link href="/cases/new" className="vault-btn-primary">+ New case</Link>
          )}
        </div>

        <div className=