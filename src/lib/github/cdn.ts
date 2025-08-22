import { getGitHubClient } from './api';
import { getCacheService } from '../cache';
import path from 'path';

let cdnService: GitHubCdnService | null = null;

/**
 * Get or create the GitHub CDN service singleton
 */
export async function getCdnService(githubToken?: string): Promise<GitHubCdnService> {
  if (cdnService) {
    return cdnService;
  }
  
  const githubClient = getGitHubClient(githubToken);
  const cacheService = await getCacheService();
  
  cdnService = new GitHubCdnService(githubClient, cacheService);
  return cdnService;
}

/**
 * Service for handling GitHub CDN-related functionality
 */
export class GitHubCdnService {
  // Cache TTL values in seconds
  private readonly DEFAULT_CACHE_TTL = 3600; // 1 hour
  private readonly LONG_CACHE_TTL = 86400; // 24 hours
  
  constructor(
    private githubClient: ReturnType<typeof getGitHubClient>,
    private cacheService: Awaited<ReturnType<typeof getCacheService>>
  ) {}
  
  /**
   * Get content from a GitHub repository file
   */
  async getGitHubContent(username: string, repo: string, branch: string, filePath: string): Promise<{
    content: string;
    contentType: string;
  }> {
    const cacheKey = this.generateGitHubCacheKey(username, repo, branch, filePath);
    
    // Try to get from cache first
    const cachedContent = await this.cacheService.get(cacheKey);
    if (cachedContent) {
      return {
        content: cachedContent,
        contentType: this.getContentTypeFromPath(filePath),
      };
    }
    
    // Fetch from GitHub if not in cache
    const repoInfo = {
      owner: username,
      repo,
      branch,
      path: filePath,
    };
    
    try {
      const file = await this.githubClient.getFileContent(repoInfo);
      const content = this.githubClient.parseContentFromBase64(file.content);
      
      // Determine appropriate TTL based on file type
      const ttl = this.determineCacheTTL(filePath);
      
      // Cache the content
      await this.cacheService.set(cacheKey, content, ttl);
      
      return {
        content,
        contentType: this.getContentTypeFromPath(filePath),
      };
    } catch (error) {
      // Handle 404 or other errors
      console.error(`Error fetching GitHub content for ${username}/${repo}/${branch}/${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Get content from a Gist
   */
  async getGistContent(username: string, gistId: string): Promise<{
    content: string;
    contentType: string;
    filename: string;
  }> {
    const cacheKey = this.generateGistCacheKey(username, gistId);
    
    // Try to get metadata from cache first (contains filename)
    const metadataKey = `${cacheKey}:metadata`;
    const cachedMetadata = await this.cacheService.get(metadataKey);
    
    if (cachedMetadata) {
      const metadata = JSON.parse(cachedMetadata);
      const cachedContent = await this.cacheService.get(cacheKey);
      
      if (cachedContent) {
        return {
          content: cachedContent,
          contentType: this.getContentTypeFromPath(metadata.filename),
          filename: metadata.filename,
        };
      }
    }
    
    // Fetch from GitHub if not in cache
    try {
      const gist = await this.githubClient.getGist(gistId);
      
      // Get the first file in the gist
      const firstFileName = Object.keys(gist.files)[0];
      const firstFile = gist.files[firstFileName];
      
      // If content is already in the response
      let content;
      if (firstFile.content) {
        content = firstFile.content;
      } else {
        // Fetch the raw content
        const response = await fetch(firstFile.raw_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch Gist content: ${response.status} ${response.statusText}`);
        }
        content = await response.text();
      }
      
      // Store metadata separately for better caching
      const metadata = {
        filename: firstFileName,
        updated_at: gist.updated_at
      };
      
      // Determine appropriate TTL based on file type
      const ttl = this.determineCacheTTL(firstFileName);
      
      // Cache the content and metadata
      await this.cacheService.set(cacheKey, content, ttl);
      await this.cacheService.set(metadataKey, JSON.stringify(metadata), ttl);
      
      return {
        content,
        contentType: this.getContentTypeFromPath(firstFileName),
        filename: firstFileName,
      };
    } catch (error) {
      console.error(`Error fetching Gist content for ${username}/${gistId}:`, error);
      throw error;
    }
  }
  
  /**
   * Determine cache TTL based on file extension and type
   */
  private determineCacheTTL(filePath: string): number {
    const extension = path.extname(filePath).toLowerCase();
    
    // Files that don't change often can be cached longer
    const longCachedExtensions = ['.md', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.pdf'];
    
    return longCachedExtensions.includes(extension) ? this.LONG_CACHE_TTL : this.DEFAULT_CACHE_TTL;
  }
  
  /**
   * Generate consistent cache key for GitHub content
   */
  private generateGitHubCacheKey(username: string, repo: string, branch: string, filePath: string): string {
    return `github:${username}:${repo}:${branch}:${filePath}`;
  }
  
  /**
   * Generate consistent cache key for Gist content
   */
  private generateGistCacheKey(username: string, gistId: string): string {
    return `gist:${username}:${gistId}`;
  }
  
  /**
   * Determine content type based on file extension
   */
  getContentTypeFromPath(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    // Map extensions that should keep their original MIME types (browser-renderable media files)
    const keepOriginalType: Record<string, string> = {
      // Images (browser can display directly)
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp',
      '.ico': 'image/x-icon',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      
      // Documents (browser can display directly)
      '.pdf': 'application/pdf',
      
      // Video (browser can play directly)
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogv': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      
      // Audio (browser can play directly)
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.oga': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.flac': 'audio/flac',
      
      // Archives and binaries (should be downloaded)
      '.zip': 'application/zip',
      '.rar': 'application/vnd.rar',
      '.7z': 'application/x-7z-compressed',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.bz2': 'application/x-bzip2',
      '.exe': 'application/octet-stream',
      '.dmg': 'application/octet-stream',
      '.deb': 'application/octet-stream',
      '.rpm': 'application/octet-stream',
      '.msi': 'application/octet-stream',
    };
    
    // If it's a media file or binary, keep original type
    if (extension in keepOriginalType) {
      return keepOriginalType[extension];
    }
    
    // For all other files (text-based), force text/plain to prevent downloads
    return 'text/plain; charset=utf-8';
  }
  
  /**
   * Check if a URL is cached
   */
  async isUrlCached(url: string): Promise<boolean> {
    const cacheKey = this.getCacheKeyFromUrl(url);
    if (!cacheKey) return false;
    return await this.cacheService.has(cacheKey);
  }
  
  /**
   * Purge a URL from the cache
   */
  async purgeUrl(url: string): Promise<boolean> {
    const cacheKey = this.getCacheKeyFromUrl(url);
    if (!cacheKey) return false;
    
    // Also purge metadata if it's a gist
    if (cacheKey.startsWith('gist:')) {
      await this.cacheService.delete(`${cacheKey}:metadata`);
    }
    
    return await this.cacheService.delete(cacheKey);
  }
  
  /**
   * Get cache key from URL
   */
  private getCacheKeyFromUrl(url: string): string | null {
    // Format: /github/username/repo/branch/path or /gist/username/gistId
    const githubRegex = /\/github\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)/;
    const gistRegex = /\/gist\/([^\/]+)\/([a-f0-9]+)/i;
    
    const githubMatch = url.match(githubRegex);
    if (githubMatch) {
      const [, username, repo, branch, filePath] = githubMatch;
      return this.generateGitHubCacheKey(username, repo, branch, filePath);
    }
    
    const gistMatch = url.match(gistRegex);
    if (gistMatch) {
      const [, username, gistId] = gistMatch;
      return this.generateGistCacheKey(username, gistId);
    }
    
    return null;
  }
} 