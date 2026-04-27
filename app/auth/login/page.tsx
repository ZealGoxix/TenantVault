'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="vault-card">
      <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#F3F4F6' }}>Welcome back</h1>
      <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Sign in to manage your inspection cases</p>

      {error && (
        <div className="rounded-lg px-4 py-3 mb-6" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="vault-label" htmlFor="email">Email address</label>
          <input id="email" type="email" required autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            className="vault-input" placeholder="you@example.com"/>
        </div>
        <div>
          <label className="vault-label" htmlFor="password">Password</label>
          <input id="password" type="password" required autoComplete="current-password"
            value={password} onChange={e => setPassword(e.target.value)}
            className="vault-input" placeholder="••••••••"/>
        </div>
        <button type="submit" disabled={loading} className="vault-btn-primary w-full mt-2">
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>

      <div className="gold-rule my-6"/>

      <p className="text-center text-sm" style={{ color: '#6B7280' }}>
        No account?{' '}
        <Link href="/auth/register" style={{ color: '#C9A84C' }}>Create one free</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
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

        <Suspense fallback={<div className="vault-card" style={{ color: '#6B7280' }}>Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}