import { describe, it, expect, beforeEach } from 'vitest';
import * as github from '@actions/github';
import { MergeRequirement } from './types';
import { validatePullRequest } from './index';

// Mock the GitHub context and octokit
const mockOctokit = {
  rest: {
    pulls: {
      get: vi.fn(),
      listCommits: vi.fn(),
    },
  },
} as unknown as ReturnType<typeof github.getOctokit>;

describe('validatePullRequest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set the current date to 2025-03-14
    vi.setSystemTime(new Date('2025-03-14'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Single source date validation', () => {
    it('should block merge if target date is in the future', async () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          value: '2025-03-15',
          source: 'description',
          priority: 2,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(false);
      expect(result.reasons[0]).toBe('Cannot merge before 2025-03-15 (1 days remaining)');
    });

    it('should allow merge if target date is today', async () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          value: '2025-03-14',
          source: 'description',
          priority: 2,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('should allow merge if target date is in the past', async () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          value: '2025-03-13',
          source: 'description',
          priority: 2,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });
  });

  describe('Multiple dates within same source', () => {
    it('should use most restrictive date from commits', async () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          value: '2025-03-13',
          source: 'commit',
          priority: 1,
        },
        {
          type: 'date',
          value: '2025-03-15', // This should be used
          source: 'commit',
          priority: 1,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(false);
      expect(result.reasons[0]).toBe('Cannot merge before 2025-03-15 (1 days remaining)');
    });

    it('should use most restrictive date from description', async () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          value: '2025-03-14',
          source: 'description',
          priority: 2,
        },
        {
          type: 'date',
          value: '2025-03-16', // This should be used
          source: 'description',
          priority: 2,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(false);
      expect(result.reasons[0]).toBe('Cannot merge before 2025-03-16 (2 days remaining)');
    });

    it('should use most restrictive date from labels', async () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          value: '2025-03-15',
          source: 'label',
          priority: 3,
        },
        {
          type: 'date',
          value: '2025-03-17', // This should be used
          source: 'label',
          priority: 3,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(false);
      expect(result.reasons[0]).toBe('Cannot merge before 2025-03-17 (3 days remaining)');
    });
  });

  describe('Multiple dates from different sources', () => {
    it('should use highest priority source with most restrictive date', async () => {
      const requirements: MergeRequirement[] = [
        // Commits (priority 1)
        {
          type: 'date',
          value: '2025-03-13',
          source: 'commit',
          priority: 1,
        },
        {
          type: 'date',
          value: '2025-03-14',
          source: 'commit',
          priority: 1,
        },
        // Description (priority 2)
        {
          type: 'date',
          value: '2025-03-14',
          source: 'description',
          priority: 2,
        },
        {
          type: 'date',
          value: '2025-03-15',
          source: 'description',
          priority: 2,
        },
        // Labels (priority 3)
        {
          type: 'date',
          value: '2025-03-15',
          source: 'label',
          priority: 3,
        },
        {
          type: 'date',
          value: '2025-03-16', // This should be used (highest priority + most restrictive)
          source: 'label',
          priority: 3,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(false);
      expect(result.reasons[0]).toBe('Cannot merge before 2025-03-16 (2 days remaining)');
    });

    it('should use most restrictive date from highest priority source only', async () => {
      const requirements: MergeRequirement[] = [
        // Description has later date but lower priority
        {
          type: 'date',
          value: '2025-03-18',
          source: 'description',
          priority: 2,
        },
        // Label dates should be used (higher priority)
        {
          type: 'date',
          value: '2025-03-15',
          source: 'label',
          priority: 3,
        },
        {
          type: 'date',
          value: '2025-03-16', // This should be used
          source: 'label',
          priority: 3,
        },
      ];

      const result = await validatePullRequest(mockOctokit, requirements);

      expect(result.canMerge).toBe(false);
      expect(result.reasons[0]).toBe('Cannot merge before 2025-03-16 (2 days remaining)');
    });
  });

  it('should allow merge if no date requirements exist', async () => {
    const requirements: MergeRequirement[] = [];

    const result = await validatePullRequest(mockOctokit, requirements);

    expect(result.canMerge).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});
