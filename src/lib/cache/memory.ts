import { CacheService } from './index';
import os from 'os';

interface CacheItem {
  value: string;
  expiresAt: number | null;
  accessCount: number;
  lastAccessed: number;
  approximateSize: number; // Approximate size in bytes
}

export class MemoryCacheService implements CacheService {
  private cache: Map<string, CacheItem> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private currentCacheSize: number = 0; // Current cache size in bytes
  private maxCachePercent: number = 75; // Max percentage of available RAM to use
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Setup periodic cleanup of expired items
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Clean up every minute
  }

  /**
   * Get maximum allowed cache size in bytes (75% of available RAM)
   */
  private getMaxCacheSize(): number {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Calculate max memory we can use (75% of total memory)
    const maxAllowedMemory = totalMemory * (this.maxCachePercent / 100);
    
    // If we've already exceeded the limit, return a reduced target
    if (usedMemory >= maxAllowedMemory) {
      // Return 50% of free memory if we're already at the limit
      return freeMemory * 0.5;
    }
    
    return maxAllowedMemory - usedMemory;
  }

  /**
   * Calculate approximate size of a string in bytes
   */
  private calculateStringSize(str: string): number {
    // Approximate size: 2 bytes per character (UTF-16 encoding)
    return str.length * 2;
  }

  /**
   * Clean up expired items and trim cache if needed
   */
  private cleanup(): void {
    const now = Date.now();
    
    // Remove expired items
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt !== null && now > item.expiresAt) {
        this.currentCacheSize -= item.approximateSize;
        this.cache.delete(key);
      }
    }
    
    // Check if we need to trim the cache based on memory usage
    const maxCacheSize = this.getMaxCacheSize();
    
    if (this.currentCacheSize > maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      // Sort by last accessed time (oldest first)
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      // Remove oldest entries until we're below the threshold
      let i = 0;
      while (this.currentCacheSize > maxCacheSize * 0.9 && i < entries.length) {
        const [key, item] = entries[i];
        this.currentCacheSize -= item.approximateSize;
        this.cache.delete(key);
        i++;
      }
    }
  }

  /**
   * Get a value from the cache
   */
  async get(key: string): Promise<string | null> {
    // Check if the key exists in the cache
    if (!this.cache.has(key)) {
      this.misses++;
      return null;
    }

    const item = this.cache.get(key)!;
    const now = Date.now();

    // Check if the item has expired
    if (item.expiresAt !== null && now > item.expiresAt) {
      this.currentCacheSize -= item.approximateSize;
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Item is valid, increment hit counter and update access stats
    this.hits++;
    item.accessCount++;
    item.lastAccessed = now;
    return item.value;
  }

  /**
   * Set a value in the cache
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    const now = Date.now();
    const expiresAt = ttl ? now + ttl * 1000 : null;
    const approximateSize = this.calculateStringSize(key) + this.calculateStringSize(value) + 32; // 32 bytes for overhead
    
    // If key exists, subtract its size from current cache size
    if (this.cache.has(key)) {
      const existingItem = this.cache.get(key)!;
      this.currentCacheSize -= existingItem.approximateSize;
    }
    
    // Add item to cache and update size
    this.cache.set(key, { 
      value, 
      expiresAt,
      accessCount: 0,
      lastAccessed: now,
      approximateSize
    });
    
    this.currentCacheSize += approximateSize;
    
    // Check if we need to run cleanup due to memory pressure
    const maxCacheSize = this.getMaxCacheSize();
    if (this.currentCacheSize > maxCacheSize) {
      this.cleanup();
    }
  }

  /**
   * Delete a value from the cache
   */
  async delete(key: string): Promise<boolean> {
    if (this.cache.has(key)) {
      const item = this.cache.get(key)!;
      this.currentCacheSize -= item.approximateSize;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Check if a key exists in the cache and is not expired
   */
  async has(key: string): Promise<boolean> {
    if (!this.cache.has(key)) {
      return false;
    }

    const item = this.cache.get(key)!;
    const now = Date.now();

    // Check if the item has expired
    if (item.expiresAt !== null && now > item.expiresAt) {
      this.currentCacheSize -= item.approximateSize;
      this.cache.delete(key);
      return false;
    }

    // Update access time
    item.lastAccessed = now;
    return true;
  }

  /**
   * Get all cache keys
   */
  async getAllKeys(): Promise<string[]> {
    const now = Date.now();
    const validKeys: string[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      // Only include non-expired items
      if (item.expiresAt === null || now <= item.expiresAt) {
        validKeys.push(key);
      }
    }
    
    return validKeys;
  }

  /**
   * Get cache statistics for all items
   */
  async getStats(): Promise<{ key: string; size: number; lastAccessed: number; accessCount: number }[]> {
    const now = Date.now();
    const stats: { key: string; size: number; lastAccessed: number; accessCount: number }[] = [];
    
    for (const [key, item] of this.cache.entries()) {
      // Only include non-expired items
      if (item.expiresAt === null || now <= item.expiresAt) {
        stats.push({
          key,
          size: item.approximateSize,
          lastAccessed: item.lastAccessed,
          accessCount: item.accessCount
        });
      }
    }
    
    return stats;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
} 