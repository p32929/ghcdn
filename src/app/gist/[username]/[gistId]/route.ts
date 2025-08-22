import { NextRequest, NextResponse } from 'next/server';
import { getCdnService } from '@/lib/github/cdn';

export const dynamic = 'force-dynamic';

/**
 * Serve Gist content
 */
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      username: string;
      gistId: string;
    }>
  }
) {
  try {
    // Properly await and destructure the params
    const params = await context.params;
    const { username, gistId } = params;
    
    // Get CDN service
    const cdnService = await getCdnService();
    
    // Get content from Gist
    const { content, contentType, filename } = await cdnService.getGistContent(
      username,
      gistId
    );
    
    // Generate ETag for caching
    const etag = `W/"${Buffer.from(`${username}/${gistId}/${filename}`).toString('base64')}"`;
    
    // Return the content with appropriate content type and caching headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'ETag': etag,
        'X-Cache-Source': 'github-cdn'
      },
    });
  } catch (error) {
    console.error('Error serving Gist content:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to serve Gist content: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 