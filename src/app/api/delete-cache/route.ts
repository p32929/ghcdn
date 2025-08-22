import { NextRequest, NextResponse } from 'next/server';
import { getCacheService } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }
    
    const cache = await getCacheService();
    
    let deleted = await cache.delete(`cdn:${url}`);
    if (!deleted) {
      deleted = await cache.delete(url);
    }
    
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Cache entry deleted successfully' : 'Cache entry not found'
    });
  } catch (error) {
    console.error('Error deleting cache entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cache entry' },
      { status: 500 }
    );
  }
}