import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/utils/env';

export async function GET() {
  try {
    // Check if Turnstile site key is properly configured
    const siteKey = env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;
    
    if (!siteKey) {
      return NextResponse.json({ 
        error: 'Turnstile site key not configured',
        configured: false 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Turnstile configuration is valid',
      configured: true,
      siteKeyLength: siteKey.length,
      siteKeyPrefix: siteKey.substring(0, 8) + '...'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check Turnstile configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
