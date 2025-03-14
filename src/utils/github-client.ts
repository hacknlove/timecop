import { Octokit } from '@octokit/rest';
import { ValidationError } from '../types';

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

  /**
   * @param token Optional GitHub token. If not provided, works with public repos only
   */
  constructor(token?: string) {
    this.octokit = new Octokit(token ? { auth: token } : {});
  }

  /**
   * Fetches PR information from GitHub
   * @throws ValidationError if PR not found
   * @throws Error for other API errors (rate limits, network issues, etc)
   */
  async getPR(owner: string, repo: string, prNumber: number): Promise<GitHubPR> {
    try {
      const { data } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

      // Extract only the fields we need
      return {
        number: data.number,
        state: data.state,
        merged: data.merged,
        mergeable: data.mergeable,
        draft: data.draft,
      };
    } catch (error: unknown) {
      // Special handling for 404 errors
      if (error instanceof Error && 'status' in error && error.status === 404) {
        throw new ValidationError(`PR not found: ${owner}/${repo}#${prNumber}`);
      }
      throw error; // Re-throw other errors
    }
  }
}
