import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 })
}

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: caseData, error } = await supabase
    .from('cases')
    .select('id, tenant_id, status')
    .eq('invite_token', params.token)
    .single()

  if (error || !caseData) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
  }

  if (caseData.status === 'closed') {
    return NextResponse.json({ error: 'Case is closed' }, { status: 403 })
  }

  // Ensure profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId)
    if (authUser?.user) {
      await supabase.from('profiles').upsert({
        id: userId,
        email: authUser.user.email ?? '',
        full_name: authUser.user.user_metadata?.full_name ?? 'Tenant',
        role: 'tenant',
      })
    }
  }

  // Link tenant if not already linked
  if (!caseData.tenant_id) {
    await supabase
      .from('cases')
      .update({ tenant_id: userId, status: 'active' })
      .eq('id', caseData.id)

    await supabase.from('audit_logs').insert({
      case_id: caseData.id,
      user_id: userId,
      event_type: 'invite_accepted',
      metadata: {},
    })
  }

  return NextResponse.json({ caseId: caseData.id })
}