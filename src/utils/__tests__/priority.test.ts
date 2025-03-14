import { describe, it, expect } from 'vitest';
import { prioritizeRequirements } from '../priority';
import { MergeRequirement } from '../../types';

describe('Requirement Prioritization', () => {
  it('should select highest priority date requirement', () => {
    const requirements: MergeRequirement[] = [
      {
        type: 'date',
        source: 'commit',
        value: '2024-01-15',
        priority: 1,
      },
      {
        type: 'date',
        source: 'description',
        value: '2024-02-15',
        priority: 2,
      },
      {
        type: 'date',
        source: 'label',
        value: '2024-03-15',
        priority: 3,
      },
    ];

    const result = prioritizeRequirements(requirements);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'date',
      source: 'label',
      value: '2024-03-15',
      priority: 3,
    });
  });

  it('should combine unique dependency requirements', () => {
    const requirements: MergeRequirement[] = [
      {
        type: 'dependency',
        source: 'commit',
        value: 'https://github.com/org/repo/pull/123',
        priority: 1,
      },
      {
        type: 'dependency',
        source: 'description',
        value: 'https://github.com/org/repo/pull/456',
        priority: 2,
      },
    ];

    const result = prioritizeRequirements(requirements);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(requirements[0]);
    expect(result).toContainEqual(requirements[1]);
  });

  it('should prefer higher priority for duplicate dependencies', () => {
    const requirements: MergeRequirement[] = [
      {
        type: 'dependency',
        source: 'commit',
        value: 'https://github.com/org/repo/pull/123',
        priority: 1,
      },
      {
        type: 'dependency',
        source: 'label',
        value: 'https://github.com/org/repo/pull/123',
        priority: 3,
      },
    ];

    const result = prioritizeRequirements(requirements);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(requirements[1]); // Should keep the label version
  });

  it('should handle mixed requirements', () => {
    const requirements: MergeRequirement[] = [
      {
        type: 'date',
        source: 'commit',
        value: '2024-01-15',
        priority: 1,
      },
      {
        type: 'dependency',
        source: 'description',
        value: 'https://github.com/org/repo/pull/123',
        priority: 2,
      },
      {
        type: 'date',
        source: 'label',
        value: '2024-03-15',
        priority: 3,
      },
      {
        type: 'dependency',
        source: 'label',
        value: 'https://github.com/org/repo/pull/456',
        priority: 3,
      },
    ];

    const result = prioritizeRequirements(requirements);
    expect(result).toHaveLength(3); // 1 date + 2 dependencies
    expect(result).toContainEqual({
      type: 'date',
      source: 'label',
      value: '2024-03-15',
      priority: 3,
    });
    expect(result).toContainEqual(requirements[1]);
    expect(result).toContainEqual(requirements[3]);
  });

  it('should handle empty requirements', () => {
    const result = prioritizeRequirements([]);
    expect(result).toHaveLength(0);
  });
});
