import type { AuditLog } from '@/types'

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  case_created:    { label: 'Case created',   color: '#C9A84C' },
  invite_sent:     { label: 'Invite sent',    color: '#0EA5E9' },
  invite_accepted: { label: 'Tenant joined',  color: '#059669' },
  photo_uploaded:  { label: 'Photo uploaded', color: '#9CA3AF' },
  pdf_exported:    { label: 'PDF exported',   color: '#A78BFA' },
  case_closed:     { label: 'Case closed',    color: '#6B7280' },
}

interface Props {
  logs: AuditLog[]
}

export default function AuditTimeline({ logs }: Props) {
  if (!logs.length) {
    return (
      <div className="vault-card border-dashed text-center py-8">
        <p className="text-sm" style={{ color: '#6B7280' }}>No audit events yet</p>
      </div>
    )
  }

  return (
    <div className="vault-card p-0 overflow-hidden">
      <div className="divide-y" style={{ borderColor: '#252830' }}>
        {logs.map((log, i) => {
          const meta = EVENT_LABELS[log.event_type] ?? { label: log.event_type, color: '#6B7280' }
          const metadata = log.metadata as Record<string, string> | null
          return (
            <div key={log.id} className="px-5 py-4 flex gap-4 items-start">
              <div className="mt-1 shrink-0">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: i === 0 ? '#C9A84C' : '#3A3E4A' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-medium" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  {log.user && (
                    <span className="font-mono text-[10px]" style={{ color: '#6B7280' }}>
                      by {log.user.full_name}
                    </span>
                  )}
                  {metadata?.file_name && (
                    <span
                      className="font-mono text-[10px] truncate max-w-[140px]"
                      style={{ color: '#3A3E4A' }}
                    >
                      {metadata.file_name}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10px] mt-0.5" style={{ color: '#3A3E4A' }}>
                  {new Date(log.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
