import { NextRequest, NextResponse } from 'next/server';
import { getCdnService } from '@/lib/github/cdn';
import { PurgeRequest, PurgeResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Purge a URL from the cache
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as PurgeRequest;
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'No URL provided'
      }, { status: 400 });
    }
    
    const cdnService = await getCdnService();
    const purged = await cdnService.purgeUrl(url);
    
    if (!purged) {
      return NextResponse.json({
        success: false,
        error: 'URL not found in cache'
      });
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error purging cache:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to purge cache: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 