'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  caseId: string
  token: string
}

export default function TenantJoinForm({ caseId, token }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'choice' | 'register' | 'login'>('choice')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    let userId: string | undefined

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName, role: 'tenant' } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      userId = data.user?.id

      // Manually upsert profile in case trigger hasn't fired yet
      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          email: form.email,
          full_name: form.fullName,
          role: 'tenant',
        })
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) { setError(error.message); setLoading(false); return }
      userId = data.user?.id
    }

    if (!userId) { setError('Authentication failed'); setLoading(false); return }

    // Link tenant to case
    const res = await fetch(`/api/invite/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to join case')
      setLoading(false)
      return
    }

    // Small delay to let DB settle, then redirect
    await new Promise(r => setTimeout(r, 500))
    router.push(`/cases/${caseId}`)
    router.refresh()
  }

  if (mode === 'choice') {
    return (
      <div className="vault-card">
        <h2 className="font-display text-xl font-bold mb-2" style={{ color: '#F3F4F6' }}>Join this case</h2>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Create a free account or sign in to upload your evidence to this inspection case.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => setMode('register')} className="vault-btn-primary w-full">
            Create free account →
          </button>
          <button onClick={() => setMode('login')} className="vault-btn-ghost w-full">
            Sign in to existing account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="vault-card">
      <button
        onClick={() => setMode('choice')}
        className="inline-flex items-center gap-1 font-mono text-xs mb-5 transition-colors"
        style={{ color: '#6B7280' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Back
      </button>

      <h2 className="font-display text-xl font-bold mb-1" style={{ color: '#F3F4F6' }}>
        {mode === 'register' ? 'Create account' : 'Sign in'}
      </h2>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
        {mode === 'register' ? 'Free tenant account — no payment required.' : 'Use your existing TenantVault account.'}
      </p>

      {error && (
        <div className="rounded-lg px-4 py-3 mb-4" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <p className="text-sm" style={{ color: '#F87171' }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="vault-label">Full name</label>
            <input type="text" required value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              className="vault-input" placeholder="Jasmine Williams"/>
          </div>
        )}
        <div>
          <label className="vault-label">Email address</label>
          <input type="email" required value={form.email}
            onChange={e => set('email', e.target.value)}
            className="vault-input" placeholder="you@example.com"/>
        </div>
        <div>
          <label className="vault-label">Password</label>
          <input type="password" required minLength={8} value={form.password}
            onChange={e => set('password', e.target.value)}
            className="vault-input" placeholder="••••••••"/>
        </div>
        <button type="submit" disabled={loading} className="vault-btn-primary w-full mt-2">
          {loading ? 'Joining case…' : mode === 'register' ? 'Create account & join case →' : 'Sign in & join case →'}
        </button>
      </form>
    </div>
  )
}