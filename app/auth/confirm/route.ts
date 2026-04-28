import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, hash, origin } = new URL(request.url)
  
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    const params = new URLSearchParams({
      error: error,
      error_code: errorCode ?? '',
      error_description: errorDescription ?? '',
    })
    return NextResponse.redirect(`${origin}/auth/reset-password?${params}`)
  }

  return NextResponse.redirect(`${origin}/auth/reset-password${hash}`)
}