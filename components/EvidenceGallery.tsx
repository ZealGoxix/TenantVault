import type { Evidence } from '@/types'

interface Props {
  evidence: Evidence[]
}

export default function EvidenceGallery({ evidence }: Props) {
  if (!evidence.length) {
    return (
      <div className="vault-card border-dashed text-center py-10">
        <p className="text-sm" style={{ color: '#6B7280' }}>No photos uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {evidence.map(ev => (
        <div key={ev.id} className="vault-card p-0 overflow-hidden group">
          <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#252830' }}>
            {ev.signed_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ev.signed_url}
                alt={ev.caption ?? ev.file_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
          </div>
          <div className="p-3">
            {ev.caption && (
              <p className="text-xs mb-1 leading-snug" style={{ color: '#9CA3AF' }}>{ev.caption}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px]" style={{ color: '#3A3E4A' }}>
                {ev.uploader?.full_name ?? 'Unknown'}
              </span>
              <span className="font-mono text-[10px]" style={{ color: '#3A3E4A' }}>
                {new Date(ev.uploaded_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
