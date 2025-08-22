import { GitHubFile, Gist, RepoInfo } from '@/types';

class GitHubClient {
  private token: string | null = null;
  
  constructor(token?: string) {
    this.token = token || null;
  }
  
  /**
   * Set GitHub API token
   */
  setToken(token: string): void {
    this.token = token;
  }
  
  /**
   * Create headers for GitHub API requests
   */
  private createHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }
  
  /**
   * Get file content from GitHub
   */
  async getFileContent(repoInfo: RepoInfo): Promise<GitHubFile> {
    const { owner, repo, branch, path } = repoInfo;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    
    const response = await fetch(url, {
      headers: this.createHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API error: ${error.message}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get a gist by ID
   */
  async getGist(gistId: string): Promise<Gist> {
    const url = `https://api.github.com/gists/${gistId}`;
    
    const response = await fetch(url, {
      headers: this.createHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API error: ${error.message}`);
    }
    
    return await response.json();
  }
  
  /**
   * Parse content from Base64 encoding
   */
  parseContentFromBase64(content: string): string {
    return Buffer.from(content, 'base64').toString('utf-8');
  }
}

// GitHub client singleton
let githubClient: GitHubClient | null = null;

/**
 * Get or create GitHub client
 */
export function getGitHubClient(token?: string): GitHubClient {
  if (!githubClient) {
    githubClient = new GitHubClient(token);
  } else if (token) {
    githubClient.setToken(token);
  }
  
  return githubClient;
} 