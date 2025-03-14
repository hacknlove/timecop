import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectFromDescription } from '../description';
import { Octokit } from '@octokit/rest';

describe('Description Collector', () => {
  const mockOctokit = {
    rest: {
      pulls: {
        get: vi.fn(),
      },
    },
  } as unknown as Octokit;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should collect date requirements from description', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        body: `
Some PR description

## MERGE REQUIREMENTS:
* after: 2024-01-15
* unrelated item
`,
      },
    });

    const requirements = await collectFromDescription(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toEqual({
      type: 'date',
      source: 'description',
      value: '2024-01-15',
      priority: 2,
    });
  });

  it('should collect dependency requirements from description', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        body: `
## MERGE REQUIREMENTS:
* merged: https://github.com/org/repo/pull/456
`,
      },
    });

    const requirements = await collectFromDescription(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toEqual({
      type: 'dependency',
      source: 'description',
      value: 'https://github.com/org/repo/pull/456',
      priority: 2,
    });
  });

  it('should collect multiple requirements from description', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        body: `
## MERGE REQUIREMENTS:
* after: 2024-01-15
* merged: https://github.com/org/repo/pull/456
* merged: https://github.com/org/repo/pull/789
`,
      },
    });

    const requirements = await collectFromDescription(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(3);
    expect(requirements).toContainEqual({
      type: 'date',
      source: 'description',
      value: '2024-01-15',
      priority: 2,
    });
    expect(requirements).toContainEqual({
      type: 'dependency',
      source: 'description',
      value: 'https://github.com/org/repo/pull/456',
      priority: 2,
    });
  });

  it('should handle missing description gracefully', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        body: null,
      },
    });

    const requirements = await collectFromDescription(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(0);
  });

  it('should handle description without requirements section', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        body: 'Just a regular PR description',
      },
    });

    const requirements = await collectFromDescription(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(0);
  });

  it('should stop parsing at next section', async () => {
    mockOctokit.rest.pulls.get.mockResolvedValue({
      data: {
        body: `
## MERGE REQUIREMENTS:
* after: 2024-01-15
* merged: https://github.com/org/repo/pull/456

## Another Section
* merged: https://github.com/org/repo/pull/789
`,
      },
    });

    const requirements = await collectFromDescription(
      mockOctokit,
      'owner',
      'repo',
      123
    );

    expect(requirements).toHaveLength(2);
  });
}); 