'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'landlord' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="vault-card max-w-md w-full text-center animate-fade-up">
          <div className="w-12 h-12 rounded-full bg-vault-emerald/20 border border-vault-emerald/40 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-vault-snow mb-2">Check your email</h2>
          <p className="font-body text-sm text-vault-ash">
            We sent a confirmation link to <strong className="text-vault-snow">{email}</strong>.
            Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-up">
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
          <h1 className="font-display text-2xl font-bold text-vault-snow mb-1">Create your account</h1>
          <p className="font-body text-sm text-vault-ash mb-8">Landlord accounts are free forever</p>

          {error && (
            <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-red-400 font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="vault-label" htmlFor="fullName">Full name</label>
              <input id="fullName" type="text" required value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="vault-input" placeholder="Marcus Johnson"/>
            </div>
            <div>
              <label className="vault-label" htmlFor="email">Email address</label>
              <input id="email" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="vault-input" placeholder="you@example.com"/>
            </div>
            <div>
              <label className="vault-label" htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={8} value={password}
                onChange={e => setPassword(e.target.value)}
                className="vault-input" placeholder="8+ characters"/>
            </div>
            <button type="submit" disabled={loading} className="vault-btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account →'}
            </button>
          </form>

          <div className="gold-rule my-6"/>
          <p className="text-center font-body text-sm text-vault-ash">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-vault-gold hover:text-vault-gold-light transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
