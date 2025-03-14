import { ValidationError } from '../types';
import { GitHubClient } from './github-client';

/**
 * Represents a parsed GitHub Pull Request URL
 */
export interface PullRequest {
  owner: string; // Repository owner/org
  repo: string; // Repository name
  number: number; // PR number
}

export interface PRValidationResult {
  canMerge: boolean;
  reason?: string; // Error message if canMerge is false
}

/**
 * Parses a GitHub PR URL into its components
 * Example URL: https://github.com/owner/repo/pull/123
 */
function parsePRUrl(prUrl: string): PullRequest {
  // Non-escaped forward slashes in regex for better readability
  const prPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/;
  const match = prUrl.match(prPattern);

  if (!match) {
    throw new ValidationError(
      'Invalid PR URL format. Expected: https://github.com/owner/repo/pull/123'
    );
  }

  const [, owner, repo, prNumber] = match;
  return {
    owner,
    repo,
    number: parseInt(prNumber, 10),
  };
}

/**
 * Validates PR existence and status
 * Works with both public and private repositories
 */
export class PRValidator {
  private client: GitHubClient;

  constructor(token?: string) {
    this.client = new GitHubClient(token);
  }

  /**
   * Validates if a PR exists and is accessible
   * @param prUrl GitHub PR URL
   * @returns Validation result
   */
  async validatePRExists(prUrl: string): Promise<PRValidationResult> {
    try {
      const pr = parsePRUrl(prUrl);
      const prDetails = await this.client.getPR(pr.owner, pr.repo, pr.number);

      if (prDetails.state === 'closed' && !prDetails.merged) {
        return {
          canMerge: false,
          reason: `PR ${prUrl} is closed without being merged`,
        };
      }

      if (prDetails.draft) {
        return {
          canMerge: false,
          reason: `PR ${prUrl} is in draft state`,
        };
      }

      return { canMerge: true };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          canMerge: false,
          reason: error.message,
        };
      }
      throw error;
    }
  }
}

export { parsePRUrl };
