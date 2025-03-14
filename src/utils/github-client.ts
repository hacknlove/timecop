import { Octokit } from '@octokit/rest';
import { ValidationError } from '../types';
import { Cache } from './cache';

/**
 * Represents a GitHub Pull Request with essential status information
 */
export interface GitHubPR {
  number: number;
  state: string; // 'open' | 'closed'
  merged: boolean; // true if PR was merged
  mergeable: boolean | null; // null while GitHub is calculating merge status
  draft: boolean; // true for draft PRs
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly resetAt: Date,
    public readonly remaining: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
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
    MERGED: 5 * 60 * 1000, // 5 minutes for merged PRs
    CLOSED: 60 * 1000, // 1 minute for closed PRs
    DEFAULT: 30 * 1000, // 30 seconds for open PRs
  };

  // Rate limit retry settings
  private static readonly RETRY = {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000, // Start with 1 second delay
    MAX_DELAY: 10000, // Max 10 second delay
  };

  /**
   * @param token Optional GitHub token. If not provided, works with public repos only
   */
  constructor(token?: string) {
    this.octokit = new Octokit(token ? { auth: token } : {});
    this.cache = new Cache<GitHubPR>(GitHubClient.TTL.DEFAULT);
  }

  /**
   * Fetches PR information from GitHub with rate limit handling
   * @throws ValidationError if PR not found
   * @throws RateLimitError if rate limit is nearly exhausted
   * @throws Error for other API errors (rate limits, network issues, etc)
   */
  async getPR(owner: string, repo: string, number: number): Promise<GitHubPR> {
    const cacheKey = `${owner}/${repo}#${number}`;

    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    let attempt = 0;
    while (attempt < GitHubClient.RETRY.MAX_ATTEMPTS) {
      try {
        const response = await this.octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: number,
        });

        // Check remaining rate limit
        const remaining = parseInt(response.headers['x-ratelimit-remaining'] as string, 10);
        const resetAt = new Date(
          parseInt(response.headers['x-ratelimit-reset'] as string, 10) * 1000
        );

        if (remaining <= 1) {
          // Throw rate limit error but cache the response first
          const prData: GitHubPR = {
            number: response.data.number,
            state: response.data.state,
            merged: response.data.merged ?? false,
            mergeable: response.data.mergeable,
            draft: response.data.draft ?? false,
          };

          const ttl = prData.merged
            ? GitHubClient.TTL.MERGED
            : prData.state === 'closed'
              ? GitHubClient.TTL.CLOSED
              : GitHubClient.TTL.DEFAULT;

          this.cache.set(cacheKey, prData, ttl);

          throw new RateLimitError(
            `Rate limit nearly exhausted (${remaining} remaining). Resets at ${resetAt.toISOString()}`,
            resetAt,
            remaining
          );
        }

        // Extract and cache PR data
        const prData: GitHubPR = {
          number: response.data.number,
          state: response.data.state,
          merged: response.data.merged ?? false,
          mergeable: response.data.mergeable,
          draft: response.data.draft ?? false,
        };

        const ttl = prData.merged
          ? GitHubClient.TTL.MERGED
          : prData.state === 'closed'
            ? GitHubClient.TTL.CLOSED
            : GitHubClient.TTL.DEFAULT;

        this.cache.set(cacheKey, prData, ttl);
        return prData;
      } catch (error: unknown) {
        if (error instanceof RateLimitError) throw error;

        if (error instanceof Error && 'status' in error) {
          const httpError = error as Error & { status: number; headers?: Record<string, string> };
          if (httpError.status === 404) {
            throw new ValidationError(`PR not found: ${cacheKey}`);
          }
          if (httpError.status === 403) {
            const resetAt = new Date(
              parseInt(httpError.headers?.['x-ratelimit-reset'] as string, 10) * 1000
            );
            throw new RateLimitError(
              `Rate limit exceeded. Resets at ${resetAt.toISOString()}`,
              resetAt,
              0
            );
          }
        }

        // For other errors, implement exponential backoff
        attempt++;
        if (attempt === GitHubClient.RETRY.MAX_ATTEMPTS) throw error;

        const delay = Math.min(
          GitHubClient.RETRY.BASE_DELAY * Math.pow(2, attempt),
          GitHubClient.RETRY.MAX_DELAY
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Maximum retry attempts reached');
  }

  /**
   * Cleans up expired cache entries
   */
  cleanupCache(): void {
    this.cache.cleanup();
  }
}
