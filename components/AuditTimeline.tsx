import type { AuditLog } from '@/types'

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  case_created:       { label: 'Case created',        color: 'text-vault-gold' },
  invite_sent:        { label: 'Invite sent',          color: 'text-vault-sky' },
  invite_accepted:    { label: 'Tenant joined',        color: 'text-emerald-400' },
  photo_uploaded:     { label: 'Photo uploaded',       color: 'text-vault-silver' },
  pdf_exported:       { label: 'PDF exported',         color: 'text-purple-400' },
  case_closed:        { label: 'Case closed',          color: 'text-vault-ash' },
}

interface Props {
  logs: AuditLog[]
}

export default function AuditTimeline({ logs }: Props) {
  if (!logs.length) {
    return (
      <div className="vault-card border-dashed text-center py-8">
        <p className="font-body text-sm text-vault-ash">No audit events yet</p>
      </div>
    )
  }

  return (
    <div className="vault-card p-0 overflow-hidden">
      <div className="divide-y divide-vault-steel/50">
        {logs.map((log, i) => {
          const meta = EVENT_LABELS[log.event_type] ?? { label: log.event_type, color: 'text-vault-ash' }
          return (
            <div key={log.id} className={`px-5 py-4 flex gap-4 items-start ${i === 0 ? '' : ''}`}>
              {/* Timeline dot */}
              <div className="mt-1 shrink-0 flex flex-col items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-vault-gold' : 'bg-vault-mist'}`}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-xs font-medium ${meta.color}`}>{meta.label}</span>
                  {log.user && (
                    <span className="font-mono text-[10px] text-vault-ash">by {log.user.full_name}</span>
                  )}
                  {(log.metadata as Record<string, unknown>)?.file_name && (
                    <span className="font-mono text-[10px] text-vault-mist truncate max-w-[140px]">
                      {String((log.metadata as Record<string, unknown>).file_name)}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-vault-mist mt-0.5">
                  {new Date(log.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
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
