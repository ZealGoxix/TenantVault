import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('cases')
    .select('id, address, unit_number, move_out_date, status, tenant_id')
    .eq('invite_token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  return NextResponse.json(data)
}