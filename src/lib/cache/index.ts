// Cache service interface
export interface CacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
  getAllKeys(): Promise<string[]>;
  getStats(): Promise<{ key: string; size: number; lastAccessed: number; accessCount: number }[]>;
}

let cacheService: CacheService | null = null;

/**
 * Get or create the cache service singleton
 */
export async function getCacheService(): Promise<CacheService> {
  if (cacheService) {
    return cacheService;
  }

  // For now, we'll use in-memory cache
  // In a production environment, you'd want to use Redis or another external cache
  const { MemoryCacheService } = await import('./memory');
  cacheService = new MemoryCacheService();
  
  return cacheService;
} 