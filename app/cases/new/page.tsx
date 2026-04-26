'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewCasePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    address: '',
    unit_number: '',
    move_out_date: '',
    notes: '',
  })
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data, error } = await supabase
      .from('cases')
      .insert({
        landlord_id: user.id,
        address: form.address,
        unit_number: form.unit_number || null,
        move_out_date: form.move_out_date,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // log audit event
    await supabase.from('audit_logs').insert({
      case_id: data.id,
      user_id: user.id,
      event_type: 'case_created',
      metadata: { address: form.address },
    })

    router.push(`/cases/${data.id}`)
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-8 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-xs text-vault-ash hover:text-vault-gold transition-colors mb-8">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        Back to dashboard
      </Link>

      <h1 className="font-display text-3xl font-bold text-vault-snow mb-2">New inspection case</h1>
      <p className="font-body text-sm text-vault-ash mb-8">
        Enter the property details. You'll get an invite link for your tenant on the next screen.
      </p>

      <div className="gold-rule mb-8"/>

      {error && (
        <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-400 font-body">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="vault-label" htmlFor="address">Property address</label>
          <input id="address" type="text" required
            value={form.address} onChange={e => set('address', e.target.value)}
            className="vault-input" placeholder="123 Main St, New Orleans, LA 70115"/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="vault-label" htmlFor="unit">Unit / Apt number <span className="normal-case text-vault-mist">(optional)</span></label>
            <input id="unit" type="text"
              value={form.unit_number} onChange={e => set('unit_number', e.target.value)}
              className="vault-input" placeholder="4B"/>
          </div>
          <div>
            <label className="vault-label" htmlFor="moveout">Move-out date</label>
            <input id="moveout" type="date" required
              value={form.move_out_date} onChange={e => set('move_out_date', e.target.value)}
              className="vault-input"/>
          </div>
        </div>

        <div className="vault-card bg-vault-ink border-vault-gold/20">
          <div className="flex gap-3">
            <svg className="shrink-0 mt-0.5 text-vault-gold" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <div>
              <p className="font-body text-xs text-vault-gold font-semibold mb-1">Security note</p>
              <p className="font-body text-xs text-vault-ash leading-relaxed">
                Once created, evidence in this case cannot be edited or deleted — by either party.
                Row Level Security policies enforce this at the database level.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Link href="/dashboard" className="vault-btn-ghost flex-1 text-center">Cancel</Link>
          <button type="submit" disabled={loading} className="vault-btn-primary flex-1">
            {loading ? 'Creating…' : 'Create case & get invite link →'}
          </button>
        </div>
      </form>
    </div>
  )
}
