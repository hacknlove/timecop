import { describe, it, expect } from 'vitest';
import { validateRequirements } from '../validator';
import { MergeRequirement } from '../../types';

describe('Requirement Validator', () => {
  describe('Date Requirements', () => {
    it('should validate correct date format', () => {
      const req: MergeRequirement = {
        type: 'date',
        source: 'label',
        value: '2024-01-15',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(0);
    });

    it('should validate correct date-time format', () => {
      const req: MergeRequirement = {
        type: 'date',
        source: 'description',
        value: '2024-01-15 14:30',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(0);
    });

    it('should catch invalid date format', () => {
      const req: MergeRequirement = {
        type: 'date',
        source: 'commit',
        value: '15-01-2024',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid date format');
    });

    it('should catch invalid date values', () => {
      const req: MergeRequirement = {
        type: 'date',
        source: 'label',
        value: '2024-13-45',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid date values');
    });

    it('should catch invalid time values', () => {
      const req: MergeRequirement = {
        type: 'date',
        source: 'description',
        value: '2024-01-15 25:70',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid time values');
    });
  });

  describe('Dependency Requirements', () => {
    it('should validate correct PR URL format', () => {
      const req: MergeRequirement = {
        type: 'dependency',
        source: 'commit',
        value: 'https://github.com/org/repo/pull/123',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(0);
    });

    it('should catch invalid PR URL format', () => {
      const req: MergeRequirement = {
        type: 'dependency',
        source: 'label',
        value: 'https://not-github.com/org/repo/123',
        priority: 1,
      };

      const errors = validateRequirements([req]);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Invalid GitHub PR URL format');
    });
  });

  it('should validate multiple requirements', () => {
    const reqs: MergeRequirement[] = [
      {
        type: 'date',
        source: 'description',
        value: 'invalid-date',
        priority: 1,
      },
      {
        type: 'dependency',
        source: 'commit',
        value: 'invalid-url',
        priority: 1,
      },
    ];

    const errors = validateRequirements(reqs);
    expect(errors).toHaveLength(2);
  });
});
