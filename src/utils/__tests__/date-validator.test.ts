import { describe, it, expect } from 'vitest';
import { validateDateFormat, validateDateRange } from '../date-validator';

describe('Date Validator', () => {
  describe('validateDateFormat', () => {
    it('should validate correct date format', () => {
      const result = validateDateFormat('2024-01-15');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct date-time format', () => {
      const result = validateDateFormat('2024-01-15 14:30');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate date-time with timezone', () => {
      const result = validateDateFormat('2024-01-15 14:30 UTC+01:00');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty string', () => {
      const result = validateDateFormat('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date string cannot be empty');
    });

    it('should reject invalid date format', () => {
      const result = validateDateFormat('15/01/2024');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ]'
      );
    });
  });

  describe('validateDateRange', () => {
    it('should validate date in allowed range', () => {
      const result = validateDateRange('2025-04-14');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate far future dates', () => {
      const result = validateDateRange('2030-04-14');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate past dates', () => {
      const result = validateDateRange('2020-02-14');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should include format errors', () => {
      const result = validateDateRange('invalid-date');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ]'
      );
    });
  });
});
