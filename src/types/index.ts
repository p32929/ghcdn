// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Repository information
export interface RepoInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

// GitHub file response
export interface GitHubFile {
  content: string;
  encoding: string;
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
}

// Gist file
export interface GistFile {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: number;
  content?: string;
}

// Gist response
export interface Gist {
  id: string;
  files: Record<string, GistFile>;
  description: string;
  owner: {
    login: string;
  };
  created_at: string;
  updated_at: string;
}

// Cache check request
export interface CacheCheckRequest {
  url: string;
}

// Cache check response
export interface CacheCheckResponse {
  success: boolean;
  cached: boolean;
  error?: string;
}

// Purge request
export interface PurgeRequest {
  url: string;
}

// Purge response
export interface PurgeResponse {
  success: boolean;
  error?: string;
} 