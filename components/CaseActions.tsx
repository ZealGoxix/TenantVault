'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  caseId: string
  status: string
}

export default function CaseActions({ caseId, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  if (status === 'closed') return null

  async function closeCase() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('cases').update({ status: 'closed' }).eq('id', caseId)
    await supabase.from('audit_logs').insert({
      case_id: caseId,
      user_id: user?.id,
      event_type: 'case_closed',
      metadata: {},
    })

    setLoading(false)
    setConfirm(false)
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-vault-ash">Close case? No more uploads.</span>
        <button
          onClick={closeCase}
          disabled={loading}
          className="font-mono text-xs bg-crimson/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Closing…' : 'Confirm close'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="font-mono text-xs text-vault-ash hover:text-vault-silver transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="vault-btn-ghost text-xs py-1.5 px-3"
    >
      Close case
    </button>
  )
}
