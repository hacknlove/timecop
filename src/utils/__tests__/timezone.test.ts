import { describe, it, expect } from 'vitest';
import { parseTimezone, convertToUTC, formatWithTimezone } from '../timezone';
import { ValidationError } from '../../types';

describe('Timezone Handler', () => {
  describe('parseTimezone', () => {
    it('should handle named timezones', () => {
      expect(parseTimezone('UTC')).toEqual({ offsetMinutes: 0, name: 'UTC' });
      expect(parseTimezone('EST')).toEqual({ offsetMinutes: -300, name: 'EST' });
      expect(parseTimezone('PDT')).toEqual({ offsetMinutes: -420, name: 'PDT' });
    });

    it('should handle UTC offsets', () => {
      expect(parseTimezone('UTC+00:00')).toEqual({ offsetMinutes: 0, name: 'UTC+00:00' });
      expect(parseTimezone('UTC+01:00')).toEqual({ offsetMinutes: 60, name: 'UTC+01:00' });
      expect(parseTimezone('UTC-05:00')).toEqual({ offsetMinutes: -300, name: 'UTC-05:00' });
    });

    it('should handle simplified UTC offsets', () => {
      expect(parseTimezone('UTC+1')).toEqual({ offsetMinutes: 60, name: 'UTC+01:00' });
      expect(parseTimezone('UTC-5')).toEqual({ offsetMinutes: -300, name: 'UTC-05:00' });
    });

    it('should be case insensitive', () => {
      expect(parseTimezone('est')).toEqual({ offsetMinutes: -300, name: 'EST' });
      expect(parseTimezone('utc+01:00')).toEqual({ offsetMinutes: 60, name: 'UTC+01:00' });
    });

    it('should handle whitespace', () => {
      expect(parseTimezone('  UTC  ')).toEqual({ offsetMinutes: 0, name: 'UTC' });
      expect(parseTimezone(' UTC+01:00 ')).toEqual({ offsetMinutes: 60, name: 'UTC+01:00' });
    });

    it('should reject invalid timezones', () => {
      expect(() => parseTimezone('INVALID')).toThrow(ValidationError);
      expect(() => parseTimezone('UTC+25:00')).toThrow(ValidationError);
      expect(() => parseTimezone('UTC+00:60')).toThrow(ValidationError);
    });
  });

  describe('convertToUTC', () => {
    it('should convert from EST to UTC', () => {
      const est = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
      const utc = convertToUTC(est, 'EST');
      expect(utc.toISOString()).toBe('2024-01-15T17:00:00.000Z');
    });

    it('should convert from UTC+01:00 to UTC', () => {
      const local = new Date(Date.UTC(2024, 0, 15, 12, 0, 0));
      const utc = convertToUTC(local, 'UTC+01:00');
      expect(utc.toISOString()).toBe('2024-01-15T11:00:00.000Z');
    });

    it('should handle daylight saving timezones', () => {
      const pdt = new Date(Date.UTC(2024, 6, 15, 12, 0, 0));
      const utc = convertToUTC(pdt, 'PDT');
      expect(utc.toISOString()).toBe('2024-07-15T19:00:00.000Z');
    });
  });

  describe('formatWithTimezone', () => {
    it('should format UTC date in EST', () => {
      const utc = new Date(Date.UTC(2024, 0, 15, 17, 0, 0));
      expect(formatWithTimezone(utc, 'EST')).toBe('2024-01-15 12:00 EST');
    });

    it('should format UTC date in UTC+01:00', () => {
      const utc = new Date(Date.UTC(2024, 0, 15, 11, 0, 0));
      expect(formatWithTimezone(utc, 'UTC+01:00')).toBe('2024-01-15 12:00 UTC+01:00');
    });

    it('should handle midnight crossing', () => {
      const utc = new Date(Date.UTC(2024, 0, 15, 2, 0, 0));
      expect(formatWithTimezone(utc, 'UTC-05:00')).toBe('2024-01-14 21:00 UTC-05:00');
    });
  });
});
