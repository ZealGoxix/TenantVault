import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Case } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  draft:             'bg-vault-mist/30 text-vault-ash',
  active:            'bg-vault-emerald/20 text-emerald-400',
  evidence_submitted:'bg-vault-sky/20 text-sky-400',
  closed:            'bg-vault-mist/20 text-vault-silver',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false })

  const caseList = (cases as Case[]) ?? []

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="border-b border-vault-steel/40 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-vault-gold flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="10" rx="2" stroke="#0D0F12" strokeWidth="1.5"/>
              <path d="M5 12v2M11 12v2M8 6v4M6 8h4" stroke="#0D0F12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-vault-snow">TenantVault</span>
        </Link>

        <div className="flex items-center gap-6">
          <span className="font-body text-sm text-vault-ash hidden sm:block">
            {profile?.full_name ?? user.email}
          </span>
          <form action="/auth/signout" method="post">
            <button className="font-body text-xs text-vault-mist hover:text-vault-silver transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-vault-snow">Inspection Cases</h1>
            <p className="font-body text-sm text-vault-ash mt-1">
              {caseList.length === 0 ? 'No cases yet' : `${caseList.length} case${caseList.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/cases/new" className="vault-btn-primary">
            + New case
          </Link>
        </div>

        <div className="gold-rule mb-8"/>

        {/* Cases grid */}
        {caseList.length === 0 ? (
          <div className="vault-card text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-vault-steel flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h3 className="font-display text-xl text-vault-snow mb-2">No cases yet</h3>
            <p className="font-body text-sm text-vault-ash mb-6 max-w-xs mx-auto">
              Create your first inspection case to start building a tamper-evident evidence record.
            </p>
            <Link href="/cases/new" className="vault-btn-primary inline-block">
              Create first case →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {caseList.map((c, i) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="vault-card hover:border-vault-gold/40 transition-all duration-200 flex items-center justify-between group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-display text-base font-semibold text-vault-snow truncate group-hover:text-vault-gold-light transition-colors">
                      {c.address}{c.unit_number ? ` · Unit ${c.unit_number}` : ''}
                    </h2>
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[c.status] ?? STATUS_STYLES.draft}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-vault-ash">
                    Move-out: {new Date(c.move_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    Created {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <svg className="ml-4 shrink-0 text-vault-mist group-hover:text-vault-gold transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
