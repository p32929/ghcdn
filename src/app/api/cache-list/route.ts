import { NextRequest, NextResponse } from 'next/server';
import { getCacheService } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cache = await getCacheService();
    const keys = await cache.getAllKeys();
    const stats = await cache.getStats();
    
    const items = keys.map(key => {
      const stat = stats.find(s => s.key === key);
      const url = key.startsWith('cdn:') ? key.substring(4) : key;
      
      return {
        url,
        cached: true,
        size: stat?.size || 0,
        lastAccessed: stat?.lastAccessed || 0,
        accessCount: stat?.accessCount || 0
      };
    });
    
    return NextResponse.json({
      success: true,
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Error getting cache list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cache list' },
      { status: 500 }
    );
  }
}