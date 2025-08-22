import { NextRequest, NextResponse } from 'next/server';
import { getCdnService } from '@/lib/github/cdn';
import { CacheCheckRequest, CacheCheckResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Check if a URL is cached
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as CacheCheckRequest;
    
    if (!url) {
      return NextResponse.json({
        success: false,
        cached: false,
        error: 'No URL provided'
      }, { status: 400 });
    }
    
    const cdnService = await getCdnService();
    const isCached = await cdnService.isUrlCached(url);
    
    return NextResponse.json({
      success: true,
      cached: isCached
    });
  } catch (error) {
    console.error('Error checking cache:', error);
    
    return NextResponse.json({
      success: false,
      cached: false,
      error: `Failed to check cache: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 