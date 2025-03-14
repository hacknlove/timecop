import { describe, it, expect } from 'vitest';
import { validateMergeDate } from '../merge-validator';

describe('Merge Validator', () => {
  describe('validateMergeDate', () => {
    it('should allow merge if no date requirement', () => {
      const result = validateMergeDate(undefined);
      expect(result.canMerge).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should allow merge if date is in the past', () => {
      const now = new Date('2025-03-14T12:00:00Z');
      const result = validateMergeDate('2025-03-13 12:00', now);
      expect(result.canMerge).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should prevent merge if date is in the future', () => {
      const now = new Date('2025-03-14T12:00:00Z');
      const result = validateMergeDate('2025-03-15 12:00', now);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toBe('PR cannot be merged before 2025-03-15 12:00');
    });

    it('should handle dates without time', () => {
      const now = new Date('2025-03-14T12:00:00Z');
      const result = validateMergeDate('2025-03-15', now);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toBe('PR cannot be merged before 2025-03-15');
    });

    it('should handle dates with timezone', () => {
      const now = new Date('2025-03-14T12:00:00Z');
      const result = validateMergeDate('2025-03-14 13:00 UTC+01:00', now);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toBe('PR cannot be merged before 2025-03-14 13:00 UTC+01:00');
    });

    it('should handle invalid date format', () => {
      const result = validateMergeDate('invalid-date');
      expect(result.canMerge).toBe(false);
      expect(result.reason).toBe(
        'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ]'
      );
    });
  });
});
