import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-vault-steel/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-vault-gold flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="10" rx="2" stroke="#0D0F12" strokeWidth="1.5"/>
              <path d="M5 12v2M11 12v2M8 6v4M6 8h4" stroke="#0D0F12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-bold text-vault-snow tracking-tight">TenantVault</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth/login" className="vault-btn-ghost text-sm py-2 px-4">Sign in</Link>
          <Link href="/auth/register" className="vault-btn-primary text-sm py-2 px-4">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-vault-charcoal border border-vault-gold/30 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-vault-emerald animate-pulse"/>
          <span className="font-mono text-xs text-vault-gold tracking-widest uppercase">Tamper-evident • Court-ready</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-vault-snow leading-[1.05] max-w-4xl mb-6">
          The neutral record for{' '}
          <span className="text-vault-gold">move-out disputes</span>
        </h1>

        <p className="font-body text-vault-silver text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          Upload photo evidence. Build an immutable audit trail. Export a court-admissible PDF.
          No more he-said / she-said.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/auth/register" className="vault-btn-primary text-base py-4 px-8">
            Create an inspection case →
          </Link>
          <Link href="#how-it-works" className="vault-btn-ghost text-base py-4 px-8">
            See how it works
          </Link>
        </div>

        <div className="gold-rule w-full max-w-xl mb-20"/>

        {/* How it works */}
        <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
          {[
            {
              step: '01',
              title: 'Landlord creates a case',
              desc: 'Enter the property address, move-out date, and generate a unique invite link for your tenant.',
            },
            {
              step: '02',
              title: 'Both sides upload evidence',
              desc: 'Photos are timestamped, attributed, and stored in a private vault. Nothing can be deleted.',
            },
            {
              step: '03',
              title: 'Export a signed PDF',
              desc: 'Generate a complete evidence package with audit log — ready for small claims or mediation.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="vault-card group hover:border-vault-gold/40 transition-colors duration-300">
              <div className="font-mono text-vault-gold text-xs tracking-widest mb-4">{step}</div>
              <h3 className="font-display text-lg font-semibold text-vault-snow mb-2">{title}</h3>
              <p className="font-body text-sm text-vault-ash leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security callout */}
      <section className="border-t border-vault-steel/40 px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs text-vault-ash uppercase tracking-widest text-center mb-6">Security by design</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              'PostgreSQL Row Level Security',
              'Signed URLs with TTL',
              'INSERT-only audit log',
              'OWASP-aligned validation',
            ].map((f) => (
              <div key={f} className="bg-vault-charcoal border border-vault-steel rounded-lg p-4">
                <div className="w-6 h-6 mx-auto mb-2 text-vault-gold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <p className="font-body text-xs text-vault-silver leading-snug">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-vault-steel/40 px-8 py-6 text-center">
        <p className="font-mono text-xs text-vault-mist">
          TenantVault — Built with Next.js · Supabase · Vercel
        </p>
      </footer>
    </main>
  )
}
