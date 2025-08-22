export async function checkIfUrlCached(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increase timeout to 10 seconds
    
    const response = await fetch('/api/check-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
      // Add cache: 'no-store' to prevent caching of the request itself
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Cache check response not OK: ${response.status} ${response.statusText}`);
      return { success: false, cached: false };
    }
    
    const result = await response.json();
    console.log('Cache check result:', result);
    return result;
  } catch (error) {
    console.error('Error checking if URL is cached:', error);
    return { success: false, cached: false };
  }
}

export async function purgeCache(url: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Increase timeout to 10 seconds
    
    const response = await fetch('/api/purge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
      // Add cache: 'no-store' to prevent caching of the request itself
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Purge response not OK: ${response.status} ${response.statusText}`);
      return { success: false, error: `Server responded with ${response.status}: ${response.statusText}` };
    }
    
    const result = await response.json();
    console.log('Purge result:', result);
    return result;
  } catch (error) {
    console.error('Failed to purge cache:', error);
    return { success: false, error: 'Failed to purge cache' };
  }
}

export async function getCacheList() {
  try {
    const response = await fetch('/api/cache-list', {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return { success: false, items: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting cache list:', error);
    return { success: false, items: [] };
  }
}

export async function deleteCacheEntry(url: string) {
  try {
    const response = await fetch('/api/delete-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete cache entry');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error deleting cache entry:', error);
    throw error;
  }
} 