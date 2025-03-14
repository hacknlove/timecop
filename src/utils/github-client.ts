import { Octokit } from '@octokit/rest';
import { ValidationError } from '../types';

export interface GitHubPR {
  number: number;
  state: string;
  merged: boolean;
  mergeable: boolean | null;
  draft: boolean;
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token
    });
  }

  async getPR(owner: string, repo: string, prNumber: number): Promise<GitHubPR> {
    try {
      const { data } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });

      return {
        number: data.number,
        state: data.state,
        merged: data.merged,
        mergeable: data.mergeable,
        draft: data.draft
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new ValidationError(`PR not found: ${owner}/${repo}#${prNumber}`);
      }
      throw error;
    }
  }
} 