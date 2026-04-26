export type Profile = {
  id: string
  email: string
  full_name: string
  role: 'landlord' | 'tenant'
  created_at: string
}

export type CaseStatus = 'draft' | 'active' | 'closed'

export type Case = {
  id: string
  landlord_id: string
  tenant_id: string | null
  address: string
  unit_number: string | null
  move_out_date: string
  status: CaseStatus
  invite_token: string
  invite_expires_at: string | null
  created_at: string
  // joined
  landlord?: Profile
  tenant?: Profile
}

export type Evidence = {
  id: string
  case_id: string
  uploaded_by: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  caption: string | null
  uploaded_at: string
  // joined
  uploader?: Profile
  signed_url?: string
}

export type AuditLog = {
  id: string
  case_id: string
  user_id: string | null
  event_type: AuditEventType
  metadata: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  // joined
  user?: Profile
}

export type AuditEventType =
  | 'case_created'
  | 'invite_sent'
  | 'invite_accepted'
  | 'photo_uploaded'
  | 'pdf_exported'
  | 'case_closed'
