import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // Handle error redirect from Supabase
  if (error) {
    const params = new URLSearchParams({
      error: error,
      error_code: errorCode ?? '',
      error_description: errorDescription ?? '',
    })
    return NextResponse.redirect(`${origin}/auth/reset-password?${params}`)
  }

  // Handle token_hash flow (new Supabase email template style)
  if (tokenHash && type === 'recovery') {
    const supabase = await createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })

    if (verifyError) {
      const params = new URLSearchParams({
        error: 'access_denied',
        error_code: 'otp_expired',
        error_description: verifyError.message,
      })
      return NextResponse.redirect(`${origin}/auth/reset-password?${params}`)
    }

    return NextResponse.redirect(`${origin}/auth/reset-password`)
  }

  // Fallback
  return NextResponse.redirect(`${origin}/auth/reset-password`)
}