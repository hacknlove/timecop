import { Octokit } from '@octokit/rest';
import { ValidationError } from '../types';
import { Cache } from './cache';

/**
 * Represents a GitHub Pull Request with essential status information
 */
export interface GitHubPR {
  number: number;
  state: string;    // 'open' | 'closed'
  merged: boolean;  // true if PR was merged
  mergeable: boolean | null;  // null while GitHub is calculating merge status
  draft: boolean;   // true for draft PRs
}

/**
 * Handles all GitHub API interactions with proper error handling and rate limiting
 * Can work with or without authentication token
 */
export class GitHubClient {
  private octokit: Octokit;
  private cache: Cache<GitHubPR>;

  // Cache TTLs in milliseconds
  private static readonly TTL = {
    MERGED: 5 * 60 * 1000,    // 5 minutes for merged PRs
    CLOSED: 60 * 1000,        // 1 minute for closed PRs
    DEFAULT: 30 * 1000,       // 30 seconds for open PRs
  };

  /**
   * @param token Optional GitHub token. If not provided, works with public repos only
   */
  constructor(token?: string) {
    this.octokit = new Octokit(token ? { auth: token } : {});
    this.cache = new Cache<GitHubPR>(GitHubClient.TTL.DEFAULT);
  }

  /**
   * Fetches PR information from GitHub
   * @throws ValidationError if PR not found
   * @throws Error for other API errors (rate limits, network issues, etc)
   */
  async getPR(owner: string, repo: string, prNumber: number): Promise<GitHubPR> {
    const cacheKey = `${owner}/${repo}#${prNumber}`;
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      // Extract only the fields we need
      const pr: GitHubPR = {
        number: data.number,
        state: data.state,
        merged: data.merged,
        mergeable: data.mergeable,
        draft: data.draft,
      };

      // Cache with appropriate TTL based on PR state
      const ttl = pr.merged 
        ? GitHubClient.TTL.MERGED 
        : pr.state === 'closed' 
          ? GitHubClient.TTL.CLOSED 
          : GitHubClient.TTL.DEFAULT;

      this.cache.set(cacheKey, pr, ttl);
      return pr;

    } catch (error: unknown) {
      // Special handling for 404 errors
      if (error instanceof Error && 'status' in error && error.status === 404) {
        throw new ValidationError(`PR not found: ${cacheKey}`);
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Cleans up expired cache entries
   */
  cleanupCache(): void {
    this.cache.cleanup();
  }
}
