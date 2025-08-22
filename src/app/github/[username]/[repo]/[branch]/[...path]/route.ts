import { NextRequest, NextResponse } from 'next/server';
import { getCdnService } from '@/lib/github/cdn';

export const dynamic = 'force-dynamic';

/**
 * Serve GitHub content
 */
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      username: string;
      repo: string;
      branch: string;
      path: string[];
    }>
  }
) {
  try {
    // Properly await and destructure the params
    const params = await context.params;
    const { username, repo, branch, path } = params;
    const filePath = path.join('/');
    
    // Get CDN service
    const cdnService = await getCdnService();
    
    // Get content from GitHub
    const { content, contentType } = await cdnService.getGitHubContent(
      username,
      repo,
      branch,
      filePath
    );
    
    // Generate ETag for caching
    const etag = `W/"${Buffer.from(`${username}/${repo}/${branch}/${filePath}`).toString('base64')}"`;
    
    // Return the content with appropriate content type and caching headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'ETag': etag,
        'X-Cache-Source': 'github-cdn'
      },
    });
  } catch (error) {
    console.error('Error serving GitHub content:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to serve GitHub content: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 