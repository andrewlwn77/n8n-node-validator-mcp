/**
 * GitHub API client for fetching n8n node specifications
 */

// Buffer is available globally in Node.js
import { GitHubSearchResult, GitHubFileContent, RateLimitInfo } from '../../types/github.js';
import { GitHubApiError } from '../../infrastructure/errors/error-handler.js';
import { CacheManager } from '../../infrastructure/cache/cache-manager.js';

export class GitHubClient {
  private readonly apiBase = 'https://api.github.com';
  private readonly repoOwner = 'n8n-io';
  private readonly repoName = 'n8n';
  private readonly nodeBasePath = 'packages/nodes-base/nodes';
  private readonly token?: string;

  constructor(
    private cache: CacheManager,
    token?: string
  ) {
    this.token = token || process.env.GITHUB_TOKEN;
  }

  async searchNodeFiles(nodeType: string): Promise<GitHubSearchResult> {
    const cacheKey = `search:${nodeType}`;
    const cached = this.cache.get<GitHubSearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try multiple search strategies to find the node file
    // Strategy 1: Exact directory name match
    let query = `${nodeType} path:${this.nodeBasePath}/${nodeType} extension:ts`;
    let url = `${this.apiBase}/search/code?q=${encodeURIComponent(query)}`;
    
    let searchResult = await this.trySearch(url);
    
    // Strategy 2: If no results, try case variations and partial matches
    if (!searchResult.items || searchResult.items.length === 0) {
      // Try with normalized case (PascalCase)
      const normalizedType = this.normalizeNodeType(nodeType);
      query = `${normalizedType} path:${this.nodeBasePath} extension:ts filename:${normalizedType}`;
      url = `${this.apiBase}/search/code?q=${encodeURIComponent(query)}`;
      searchResult = await this.trySearch(url);
    }
    
    // Strategy 3: Broad search within the nodes directory
    if (!searchResult.items || searchResult.items.length === 0) {
      query = `${nodeType} path:${this.nodeBasePath} extension:ts`;
      url = `${this.apiBase}/search/code?q=${encodeURIComponent(query)}`;
      searchResult = await this.trySearch(url);
    }

    // Cache for 30 minutes (search results can change)
    this.cache.set(cacheKey, searchResult, 30 * 60 * 1000);

    return searchResult;
  }

  async getFileContent(path: string): Promise<GitHubFileContent> {
    const cacheKey = `file:${path}`;
    const cached = this.cache.get<GitHubFileContent>(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `${this.apiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${path}`;

    try {
      const response = await this.fetchWithAuth(url);
      const data = await response.json() as GitHubFileContent;

      // Cache for 1 hour (file content is relatively stable)
      this.cache.set(cacheKey, data, 60 * 60 * 1000);

      return data;
    } catch (error) {
      throw new GitHubApiError(
        `Failed to fetch file content: ${error instanceof Error ? error.message : String(error)}`,
        error && typeof error === 'object' && 'status' in error ? (error as any).status : undefined,
        { path }
      );
    }
  }

  async getRateLimitInfo(): Promise<RateLimitInfo> {
    const url = `${this.apiBase}/rate_limit`;

    try {
      const response = await this.fetchWithAuth(url);
      const data = await response.json();
      return data.resources.search;
    } catch (error) {
      throw new GitHubApiError(
        `Failed to get rate limit info: ${error instanceof Error ? error.message : String(error)}`,
        error && typeof error === 'object' && 'status' in error ? (error as any).status : undefined
      );
    }
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'n8n-validator-mcp'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }

      throw new GitHubApiError(errorMessage, response.status);
    }

    return response;
  }

  // Utility method to decode base64 content
  static decodeContent(content: string): string {
    return Buffer.from(content, 'base64').toString('utf-8');
  }

  private async trySearch(url: string): Promise<GitHubSearchResult> {
    try {
      const response = await this.fetchWithAuth(url);
      return await response.json() as GitHubSearchResult;
    } catch (error) {
      // Return empty result if search fails, let the caller try other strategies
      return { 
        total_count: 0, 
        incomplete_results: false, 
        items: [] 
      };
    }
  }

  private normalizeNodeType(nodeType: string): string {
    // Convert common variations to PascalCase
    if (nodeType.toLowerCase() === 'openai') return 'OpenAi';
    if (nodeType.toLowerCase() === 'http request') return 'HttpRequest';
    if (nodeType.toLowerCase() === 'webhook') return 'Webhook';
    if (nodeType.toLowerCase() === 'nocodb') return 'NocoDb';
    
    // Default: capitalize first letter and handle spaces/dashes
    return nodeType
      .split(/[\s-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}