import { describe, it, expect, beforeEach, vi } from 'vitest';
import { collectFromLabels } from '../label';
import { Octokit } from '@octokit/rest';

describe('Label Collector', () => {
  // Mock Octokit instance
  const mockOctokit = {
    rest: {
      issues: {
        listLabelsOnIssue: vi.fn(),
      },
    },
  } as unknown as Octokit;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should collect date requirements from labels', async () => {
    // Mock API response
    mockOctokit.rest.issues.listLabelsOnIssue.mockResolvedValue({
      data: [
        { name: 'after: 2024-01-15' },
        { name: 'bug' }, // Unrelated label
      ],
    });

    const requirements = await collectFromLabels(mockOctokit, 'owner', 'repo', 123);

    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toEqual({
      type: 'date',
      source: 'label',
      value: '2024-01-15',
      priority: 3,
    });
  });

  it('should collect dependency requirements from labels', async () => {
    mockOctokit.rest.issues.listLabelsOnIssue.mockResolvedValue({
      data: [
        { name: 'merged: https://github.com/org/repo/pull/456' },
        { name: 'feature' }, // Unrelated label
      ],
    });

    const requirements = await collectFromLabels(mockOctokit, 'owner', 'repo', 123);

    expect(requirements).toHaveLength(1);
    expect(requirements[0]).toEqual({
      type: 'dependency',
      source: 'label',
      value: 'https://github.com/org/repo/pull/456',
      priority: 3,
    });
  });

  it('should collect multiple requirements from labels', async () => {
    mockOctokit.rest.issues.listLabelsOnIssue.mockResolvedValue({
      data: [
        { name: 'after: 2024-01-15' },
        { name: 'merged: https://github.com/org/repo/pull/456' },
        { name: 'feature' }, // Unrelated label
      ],
    });

    const requirements = await collectFromLabels(mockOctokit, 'owner', 'repo', 123);

    expect(requirements).toHaveLength(2);
    expect(requirements).toContainEqual({
      type: 'date',
      source: 'label',
      value: '2024-01-15',
      priority: 3,
    });
    expect(requirements).toContainEqual({
      type: 'dependency',
      source: 'label',
      value: 'https://github.com/org/repo/pull/456',
      priority: 3,
    });
  });

  it('should handle API errors gracefully', async () => {
    mockOctokit.rest.issues.listLabelsOnIssue.mockRejectedValue(new Error('API Error'));

    const requirements = await collectFromLabels(mockOctokit, 'owner', 'repo', 123);

    expect(requirements).toHaveLength(0);
  });

  it('should trim whitespace from label values', async () => {
    mockOctokit.rest.issues.listLabelsOnIssue.mockResolvedValue({
      data: [
        { name: 'after:   2024-01-15  ' },
        { name: 'merged:  https://github.com/org/repo/pull/456  ' },
      ],
    });

    const requirements = await collectFromLabels(mockOctokit, 'owner', 'repo', 123);

    expect(requirements).toHaveLength(2);
    expect(requirements[0].value).toBe('2024-01-15');
    expect(requirements[1].value).toBe('https://github.com/org/repo/pull/456');
  });
});
