import { describe, it, expect, beforeEach } from 'vitest';
import { parseDate, compareDates, formatDate } from '../date-parser';
import { ValidationError } from '../../types';

describe('Date Parser', () => {
  describe('parseDate', () => {
    it('should parse valid date without time', () => {
      const result = parseDate('2024-01-15');
      expect(result.hasTime).toBe(false);
      expect(formatDate(result.date)).toBe('2024-01-15');
    });

    it('should parse valid date with time', () => {
      const result = parseDate('2024-01-15 14:30');
      expect(result.hasTime).toBe(true);
      expect(formatDate(result.date, true)).toBe('2024-01-15 14:30');
    });

    it('should handle whitespace', () => {
      const result = parseDate('  2024-01-15  ');
      expect(formatDate(result.date)).toBe('2024-01-15');
    });

    it('should reject invalid date format', () => {
      expect(() => parseDate('15-01-2024')).toThrow(ValidationError);
      expect(() => parseDate('2024/01/15')).toThrow(ValidationError);
      expect(() => parseDate('not a date')).toThrow(ValidationError);
    });

    it('should reject invalid date values', () => {
      expect(() => parseDate('2024-13-15')).toThrow(ValidationError);
      expect(() => parseDate('2024-01-32')).toThrow(ValidationError);
      expect(() => parseDate('2024-02-30')).toThrow(ValidationError);
    });

    it('should reject invalid time values', () => {
      expect(() => parseDate('2024-01-15 24:00')).toThrow(ValidationError);
      expect(() => parseDate('2024-01-15 12:60')).toThrow(ValidationError);
    });
  });

  describe('compareDates', () => {
    let now: Date;

    beforeEach(() => {
      now = new Date('2024-01-15T12:00:00Z');
    });

    it('should allow dates in the past', () => {
      const past = new Date('2024-01-14T12:00:00Z');
      expect(compareDates(past, now)).toBe(true);
    });

    it('should allow current date', () => {
      expect(compareDates(now, now)).toBe(true);
    });

    it('should reject future dates', () => {
      const future = new Date('2024-01-16T12:00:00Z');
      expect(compareDates(future, now)).toBe(false);
    });

    it('should handle time components', () => {
      const sameDay = new Date('2024-01-15T13:00:00Z');
      expect(compareDates(sameDay, now)).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format date without time', () => {
      const date = new Date('2024-01-15T12:30:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should format date with time', () => {
      const date = new Date('2024-01-15T12:30:00Z');
      expect(formatDate(date, true)).toBe('2024-01-15 12:30');
    });

    it('should pad single digits', () => {
      const date = new Date('2024-02-05T09:05:00Z');
      expect(formatDate(date, true)).toBe('2024-02-05 09:05');
    });
  });
}); 