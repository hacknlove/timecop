import { describe, it, expect } from 'vitest';
import { PRValidator } from '../pr-validator';

describe('PR Validator Integration Tests', () => {
  // For public repos, we can test without a token
  const validator = new PRValidator();

  describe('validatePRExists with real GitHub API', () => {
    it('should validate merged PR', async () => {
      const url = 'https://github.com/hacknlove/timecop/pull/1';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject closed but unmerged PR', async () => {
      const url = 'https://github.com/hacknlove/timecop/pull/2';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toBe(
        'PR https://github.com/hacknlove/timecop/pull/2 is closed without being merged'
      );
    });

    it('should validate open PR', async () => {
      const url = 'https://github.com/hacknlove/timecop/pull/3';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should handle non-existent PR', async () => {
      const url = 'https://github.com/hacknlove/timecop/pull/999999';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toContain('PR not found');
    });
  });
});
