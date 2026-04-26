'use client'

import { useState } from 'react'

interface Props {
  token: string
}

export default function InviteLinkBox({ token }: Props) {
  const [copied, setCopied] = useState(false)

  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/invite/${token}`

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="vault-card border-vault-gold/30 bg-vault-gold/5">
      <div className="flex items-start gap-3 mb-4">
        <svg className="shrink-0 mt-0.5 text-vault-gold" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <div>
          <p className="font-body text-sm font-semibold text-vault-gold mb-1">Tenant invite link</p>
          <p className="font-body text-xs text-vault-ash">Share this link with your tenant. They can upload evidence without creating an account.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="vault-input text-xs py-2 font-mono text-vault-silver flex-1"
        />
        <button
          onClick={copy}
          className={`shrink-0 px-4 py-2 rounded-lg font-mono text-xs font-medium transition-all duration-200
            ${copied
              ? 'bg-vault-emerald/20 border border-vault-emerald/40 text-emerald-400'
              : 'bg-vault-gold text-vault-ink hover:bg-vault-gold-light'
            }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
