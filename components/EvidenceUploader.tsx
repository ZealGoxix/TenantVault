'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface Props {
  caseId: string
  userId: string
}

export default function EvidenceUploader({ caseId, userId }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<string, 'pending' | 'done' | 'error'>>({})
  const [error, setError] = useState('')

  function validateFiles(incoming: File[]): File[] {
    return incoming.filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`${f.name}: only JPEG, PNG, WEBP allowed`)
        return false
      }
      if (f.size > MAX_SIZE) {
        setError(`${f.name}: exceeds 10MB limit`)
        return false
      }
      return true
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const valid = validateFiles(Array.from(e.dataTransfer.files))
    setFiles(f => [...f, ...valid])
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const valid = validateFiles(Array.from(e.target.files ?? []))
    setFiles(f => [...f, ...valid])
  }

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    setError('')
    const supabase = createClient()

    for (const file of files) {
      setProgress(p => ({ ...p, [file.name]: 'pending' }))
      try {
        const ext = file.name.split('.').pop()
        const uuid = crypto.randomUUID()
        const path = `${caseId}/${userId}/${uuid}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('inspections')
          .upload(path, file, { contentType: file.type, upsert: false })

        if (uploadError) throw uploadError

        // Sanitize caption
        const rawCaption = captions[file.name] ?? ''
        const caption = rawCaption.slice(0, 500).replace(/<[^>]*>/g, '')

        const { error: dbError } = await supabase.from('evidence').insert({
          case_id: caseId,
          uploaded_by: userId,
          storage_path: path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          caption: caption || null,
        })

        if (dbError) throw dbError

        await supabase.from('audit_logs').insert({
          case_id: caseId,
          user_id: userId,
          event_type: 'photo_uploaded',
          metadata: { file_name: file.name, file_size: file.size },
        })

        setProgress(p => ({ ...p, [file.name]: 'done' }))
      } catch {
        setProgress(p => ({ ...p, [file.name]: 'error' }))
        setError(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    setFiles([])
    setCaptions({})
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`vault-card border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center py-10 text-center
          ${dragging ? 'border-vault-gold bg-vault-gold/5' : 'hover:border-vault-gold/40'}`}
      >
        <svg className="mb-3 text-vault-ash" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <p className="font-body text-sm text-vault-silver mb-1">
          {dragging ? 'Drop photos here' : 'Drag & drop photos, or click to browse'}
        </p>
        <p className="font-mono text-xs text-vault-ash">JPEG · PNG · WEBP · Max 10MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="font-body text-xs text-red-400 bg-crimson/10 border border-crimson/20 rounded-lg px-4 py-2">{error}</p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map(f => (
            <div key={f.name} className="vault-card py-3 px-4 flex gap-4 items-start">
              <div className="w-12 h-12 shrink-0 rounded-lg bg-vault-steel overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs text-vault-silver truncate mb-2">{f.name}</p>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="Add a caption describing what this shows…"
                  value={captions[f.name] ?? ''}
                  onChange={e => setCaptions(c => ({ ...c, [f.name]: e.target.value }))}
                  className="vault-input text-xs py-2"
                />
              </div>
              <div className="shrink-0 mt-1">
                {progress[f.name] === 'done' && <span className="text-emerald-400 text-xs">✓</span>}
                {progress[f.name] === 'error' && <span className="text-red-400 text-xs">✗</span>}
                {!progress[f.name] && (
                  <button onClick={e => { e.stopPropagation(); setFiles(fl => fl.filter(x => x.name !== f.name)) }}
                    className="text-vault-mist hover:text-red-400 transition-colors text-xs">✕</button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="vault-btn-primary w-full"
          >
            {uploading ? `Uploading ${files.length} photo${files.length > 1 ? 's' : ''}…` : `Upload ${files.length} photo${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
