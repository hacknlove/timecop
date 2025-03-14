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

  it('should use highest priority date when multiple dates exist', async () => {
    const requirements: MergeRequirement[] = [
      {
        type: 'date',
        value: '2025-03-13', // Past date
        source: 'commit',
        priority: 1,
      },
      {
        type: 'date',
        value: '2025-03-15', // Future date
        source: 'description',
        priority: 2,
      },
      {
        type: 'date',
        value: '2025-03-16', // Further future date
        source: 'label',
        priority: 3,
      },
    ];

    const result = await validatePullRequest(mockOctokit, requirements);

    expect(result.canMerge).toBe(false);
    expect(result.reasons[0]).toBe('Cannot merge before 2025-03-16 (2 days remaining)');
  });

  it('should allow merge if no date requirements exist', async () => {
    const requirements: MergeRequirement[] = [];

    const result = await validatePullRequest(mockOctokit, requirements);

    expect(result.canMerge).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});
