'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10 w-fit mx-auto">
          <div className="w-9 h-9 rounded-lg bg-vault-gold flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="10" rx="2" stroke="#0D0F12" strokeWidth="1.5"/>
              <path d="M5 12v2M11 12v2M8 6v4M6 8h4" stroke="#0D0F12" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-xl font-bold text-vault-snow">TenantVault</span>
        </Link>

        <div className="vault-card">
          <h1 className="font-display text-2xl font-bold text-vault-snow mb-1">Welcome back</h1>
          <p className="font-body text-sm text-vault-ash mb-8">Sign in to manage your inspection cases</p>

          {error && (
            <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-red-400 font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="vault-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="vault-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="vault-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="vault-input"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="vault-btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="gold-rule my-6"/>

          <p className="text-center font-body text-sm text-vault-ash">
            No account?{' '}
            <Link href="/auth/register" className="text-vault-gold hover:text-vault-gold-light transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
