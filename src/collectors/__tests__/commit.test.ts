import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectFromCommits } from '../commit';
import { Octokit } from '@octokit/rest';

describe('Commit Collector', () => {
  const mockOctokit = {
    rest: {
      pulls: {
        listCommits: vi.fn(),
      },
    },
  } as unknown as Octokit;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should collect date requirements from commit messages', async () => {
    mockOctokit.rest.pulls.listCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: `feat: some feature

## MERGE REQUIREMENTS:
* after: 2024-01-15
* unrelated item`,
          },
        },
      ],
    });

    const requirements = await collectFromCommits(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toEqual({
      type: 'date',
      source: 'commit',
      value: '2024-01-15',
      priority: 1,
    });
  });

  it('should collect dependency requirements from commit messages', async () => {
    mockOctokit.rest.pulls.listCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: `feat: some feature

## MERGE REQUIREMENTS:
* merged: https://github.com/org/repo/pull/456`,
          },
        },
      ],
    });

    const requirements = await collectFromCommits(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toEqual({
      type: 'dependency',
      source: 'commit',
      value: 'https://github.com/org/repo/pull/456',
      priority: 1,
    });
  });

  it('should collect requirements from multiple commits', async () => {
    mockOctokit.rest.pulls.listCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: `feat: first feature

## MERGE REQUIREMENTS:
* after: 2024-01-15`,
          },
        },
        {
          commit: {
            message: `feat: second feature

## MERGE REQUIREMENTS:
* merged: https://github.com/org/repo/pull/456`,
          },
        },
      ],
    });

    const requirements = await collectFromCommits(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(2);
    expect(requirements).toContainEqual({
      type: 'date',
      source: 'commit',
      value: '2024-01-15',
      priority: 1,
    });
    expect(requirements).toContainEqual({
      type: 'dependency',
      source: 'commit',
      value: 'https://github.com/org/repo/pull/456',
      priority: 1,
    });
  });

  it('should handle commits without requirements section', async () => {
    mockOctokit.rest.pulls.listCommits.mockResolvedValue({
      data: [
        {
          commit: {
            message: 'feat: regular commit message',
          },
        },
      ],
    });

    const requirements = await collectFromCommits(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(0);
  });

  it('should handle API errors gracefully', async () => {
    mockOctokit.rest.pulls.listCommits.mockRejectedValue(
      new Error('API Error')
    );

    const requirements = await collectFromCommits(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(0);
  });
}); 