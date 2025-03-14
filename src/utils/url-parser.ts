import { DependencyRequirement } from '../types';

export class InvalidPullRequestURLError extends Error {
  constructor(url: string) {
    super(`Invalid pull request URL: ${url}`);
  }
}

export function parsePullRequestUrl(
  url: string
): Pick<DependencyRequirement, 'owner' | 'repo' | 'pullNumber'> {
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.endsWith('github.com')) {
      throw new InvalidPullRequestURLError(url);
    }

    const parts = urlObj.pathname.split('/');
    // Expected format: /:owner/:repo/pull/:number
    if (parts.length !== 5 || parts[3] !== 'pull') {
      throw new InvalidPullRequestURLError(url);
    }

    const [, owner, repo, , pullNumberStr] = parts;
    const pullNumber = parseInt(pullNumberStr, 10);

    if (isNaN(pullNumber)) {
      throw new InvalidPullRequestURLError(url);
    }

    return {
      owner,
      repo,
      pullNumber,
    };
  } catch (error) {
    throw new InvalidPullRequestURLError(url);
  }
}
