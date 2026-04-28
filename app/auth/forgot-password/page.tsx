'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0D0F12' }}>
        <div className="vault-card max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.4)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F3F4F6' }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
            We sent a password reset link to <strong style={{ color: '#F3F4F6' }}>{email}</strong>.
            Check your inbox and click the link.
          </p>
          <Link href="/auth/login" className="vault-btn-ghost inline-block">Back to sign in</Link>
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

        <div className="vault-card">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#F3F4F6' }}>Forgot password</h1>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            Enter your email and we'll send you a reset link.
          </p>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-6"
              style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
              <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="vault-label">Email address</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="vault-input" placeholder="you@example.com"/>
            </div>
            <button type="submit" disabled={loading} className="vault-btn-primary w-full">
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
          </form>

          <div className="gold-rule my-6"/>
          <p className="text-center text-sm" style={{ color: '#6B7280' }}>
            Remembered it?{' '}
            <Link href="/auth/login" style={{ color: '#C9A84C' }}>Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}