'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  const urlError = searchParams.get('error_code')
  const urlErrorDesc = searchParams.get('error_description')

  useEffect(() => {
    if (urlError) return // don't wait for auth state if there's already an error
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [urlError])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  // Link expired or invalid
  if (urlError) {
    return (
      <div className="vault-card text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#F3F4F6' }}>Link expired</h2>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          {urlErrorDesc?.replace(/\+/g, ' ') ?? 'This reset link has expired or already been used.'}
        </p>
        <Link href="/auth/forgot-password" className="vault-btn-primary inline-block">
          Request a new link →
        </Link>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="vault-card text-center">
        <div className="w-8 h-8 rounded-full animate-spin mx-auto mb-4"
          style={{ border: '2px solid #C9A84C', borderTopColor: 'transparent' }}/>
        <p className="text-sm" style={{ color: '#6B7280' }}>Verifying reset link…</p>
      </div>
    )
  }

  return (
    <div className="vault-card">
      <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#F3F4F6' }}>Set new password</h1>
      <p className="text-sm mb-8" style={{ color: '#6B7280' }}>Choose a strong password for your account.</p>

      {error && (
        <div className="rounded-lg px-4 py-3 mb-6"
          style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="vault-label">New password</label>
          <input type="password" required minLength={8} value={password}
            onChange={e => setPassword(e.target.value)}
            className="vault-input" placeholder="8+ characters"/>
        </div>
        <div>
          <label className="vault-label">Confirm password</label>
          <input type="password" required minLength={8} value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="vault-input" placeholder="Same password again"/>
        </div>
        <button type="submit" disabled={loading} className="vault-btn-primary w-full">
          {loading ? 'Updating…' : 'Update password →'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<div className="vault-card text-center" style={{ color: '#6B7280' }}>Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}