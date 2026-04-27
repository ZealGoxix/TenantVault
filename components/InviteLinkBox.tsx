'use client'

import { useState } from 'react'

interface Props {
  token: string
}

export default function InviteLinkBox({ token }: Props) {
  const [copied, setCopied] = useState(false)

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? ''
  const link = `${appUrl}/invite/${token}`

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="vault-card" style={{ borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.05)' }}>
      <div className="flex items-start gap-3 mb-4">
        <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
        </svg>
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: '#C9A84C' }}>Tenant invite link</p>
          <p className="text-xs" style={{ color: '#6B7280' }}>
            Share this link with your tenant. They can upload evidence without creating an account first.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="vault-input text-xs py-2 font-mono flex-1"
          style={{ color: '#9CA3AF' }}
        />
        <button
          onClick={copy}
          className="shrink-0 px-4 py-2 rounded-lg font-mono text-xs font-medium transition-all duration-200"
          style={copied
            ? { background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(5,150,105,0.4)', color: '#34D399' }
            : { background: '#C9A84C', color: '#0D0F12' }
          }
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
