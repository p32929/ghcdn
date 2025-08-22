'use client';

import { useState, useEffect } from 'react';
import { checkIfUrlCached, purgeCache, getCacheList, deleteCacheEntry } from '@/lib/api-client';

// Disable all caching for this page
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default function Home() {
  const [url, setUrl] = useState('');
  const [cdnUrl, setCdnUrl] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');
  const [showPurge, setShowPurge] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingCache, setCheckingCache] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [links, setLinks] = useState<{url: string, cdnUrl: string, cached?: boolean}[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('ghcdn_links');
    if (stored) setLinks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (links.length > 0) localStorage.setItem('ghcdn_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    const updateCache = async () => {
      if (links.length === 0) return;
      try {
        const result = await getCacheList();
        if (result.success) {
          const cached = new Set(result.items?.map((item: any) => item.url) || []);
          setLinks(prev => prev.map(link => ({
            ...link,
            cached: cached.has(link.cdnUrl) || cached.has(`cdn:${link.cdnUrl}`)
          })));
        }
      } catch (e) {}
    };
    updateCache();
  }, [links.length]);

  const generateCdnUrl = (inputUrl: string) => {
    try {
      let generatedUrl = '';
      
      // GitHub URL pattern
      if (inputUrl.includes('github.com') && !inputUrl.includes('gist.github.com')) {
        const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/;
        const match = inputUrl.match(githubRegex);
        
        if (match) {
          const [, username, repo, branch, path] = match;
          generatedUrl = `${window.location.origin}/github/${username}/${repo}/${branch}/${path}`;
        } else {
          throw new Error('Invalid GitHub URL format. Expected: https://github.com/username/repo/blob/branch/path');
        }
      } 
      // Gist URL pattern
      else if (inputUrl.includes('gist.github.com')) {
        const gistRegex = /gist\.github\.com\/([^\/]+)\/([a-f0-9]+)/i;
        const match = inputUrl.match(gistRegex);
        
        if (match) {
          const [, username, gistId] = match;
          generatedUrl = `${window.location.origin}/gist/${username}/${gistId}`;
        } else {
          throw new Error('Invalid Gist URL format. Expected: https://gist.github.com/username/gistid');
        }
      } else {
        throw new Error('URL must be a GitHub repository file or Gist URL');
      }
      
      return generatedUrl;
    } catch (error: any) {
      showError(error.message);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!url.trim()) {
      showError('Please enter a GitHub or Gist URL');
      setIsLoading(false);
      return;
    }
    
    // Hide purge button initially
    setShowPurge(false);
    
    // Generate CDN URL - this is now a pure client-side operation
    const generatedUrl = generateCdnUrl(url.trim());
    if (generatedUrl) {
      setCdnUrl(generatedUrl);
      setLastGenerated(generatedUrl);
      
      // Add to history if not exists
      if (!links.find(l => l.cdnUrl === generatedUrl)) {
        setLinks(prev => [{url: url.trim(), cdnUrl: generatedUrl}, ...prev].slice(0, 10));
      }
      
      // Clear the input
      setUrl('');
    }
    
    setIsLoading(false);
  };

  const handleCheckCache = async () => {
    if (!cdnUrl) return;
    
    setCheckingCache(true);
    
    try {
      // Check if URL is cached
      const cacheCheck = await checkIfUrlCached(cdnUrl);
      
      // Only show purge button if the content is actually cached
      if (cacheCheck && cacheCheck.success && cacheCheck.cached) {
        setShowPurge(true);
      } else {
        showError('Content not cached yet');
        console.log('Content not cached:', cacheCheck);
      }
    } catch (error) {
      console.error('Error checking cache:', error);
      showError('Error checking cache status');
    } finally {
      setCheckingCache(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cdnUrl);
      setCopyStatus('Copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showError('Failed to copy URL');
    }
  };

  const handlePurge = async () => {
    if (!cdnUrl || isPurging) return;
    
    setIsPurging(true);
    
    try {
      const response = await purgeCache(cdnUrl);
      
      // On successful purge, remove the button completely
      if (response.success) {
        // This removes the button from the DOM completely
        setShowPurge(false);
        
        // Show a more prominent success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-md shadow-lg z-50 text-base font-medium';
        toast.innerHTML = `
          <div class="flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Cache successfully purged!
          </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
          setTimeout(() => toast.remove(), 500);
        }, 3000);
      } else {
        showError(response.error || 'Failed to purge cache');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to purge cache');
    } finally {
      setIsPurging(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      showError('Failed to copy URL');
    }
  };

  const showError = (message: string) => {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  };

  const showSuccess = (message: string) => {
    // Create success toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-md shadow-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-background to-background/90 text-foreground">
      <div className="container mx-auto max-w-full">
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">GitHub CDN</h1>
          <p className="text-muted-foreground text-base">Convert GitHub or Gist URLs to CDN URLs</p>
        </header>

        <div className="bg-card rounded-lg p-4 shadow-lg border border-border/30">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="github-url" className="block text-sm font-medium mb-1">
                GitHub or Gist URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="github-url"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/60"
                  placeholder="https://github.com/username/repo/blob/branch/path"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter a GitHub repository file or Gist URL
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : "Generate CDN URL"}
            </button>
          </form>
        </div>

        
        {links.length > 0 && (
          <div className="bg-card/30 border border-border/20 rounded-lg p-4">
            <h3 className="text-sm text-muted-foreground mb-2">Recent Links</h3>
            <div className="space-y-1">
              {links.slice(0, 5).map((link, i) => {
                const isLatest = link.cdnUrl === lastGenerated;
                return (
                  <div key={i} className={`flex items-center gap-3 text-sm p-1.5 rounded ${isLatest ? 'bg-primary/10 border border-primary/20' : ''}`}>
                    <span className={`w-2 h-2 rounded-full ${link.cached ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    <div className="flex-1 truncate">
                      <div className={`font-mono text-xs truncate ${isLatest ? 'text-primary' : 'text-primary/80'}`}>{link.cdnUrl}</div>
                    </div>
                  <button 
                    onClick={() => window.open(link.cdnUrl, '_blank')} 
                    className="text-xs px-2 py-1 bg-secondary/50 hover:bg-secondary rounded"
                  >
                    Test
                  </button>
                  <button 
                    onClick={() => handleCopyUrl(link.cdnUrl)} 
                    className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                      copiedUrl === link.cdnUrl 
                        ? 'bg-green-600 text-white' 
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    {copiedUrl === link.cdnUrl ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </span>
                    ) : (
                      'Copy'
                    )}
                  </button>
                  {link.cached && (
                    <button 
                      onClick={async () => {
                        try {
                          await deleteCacheEntry(link.cdnUrl);
                          setLinks(prev => prev.map(l => l.cdnUrl === link.cdnUrl ? {...l, cached: false} : l));
                        } catch (e) {}
                      }}
                      className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                    >
                      Del Cache
                    </button>
                  )}
                  <button 
                    onClick={() => setLinks(prev => prev.filter(l => l.cdnUrl !== link.cdnUrl))} 
                    className="text-xs px-1 py-1 hover:bg-secondary rounded text-muted-foreground"
                  >
                    ✕
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}
        
        <footer className="mt-4 text-center text-sm text-muted-foreground">
          <p>Serve GitHub and Gist content directly with optimized delivery</p>
        </footer>
      </div>
    </div>
  );
} 