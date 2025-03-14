import { ValidationError } from '../types';

// Common timezone offsets in minutes
const TIMEZONE_OFFSETS: Record<string, number> = {
  UTC: 0,
  GMT: 0,
  EST: -300, // UTC-5
  EDT: -240, // UTC-4
  CST: -360, // UTC-6
  CDT: -300, // UTC-5
  MST: -420, // UTC-7
  MDT: -360, // UTC-6
  PST: -480, // UTC-8
  PDT: -420, // UTC-7
};

interface TimezoneInfo {
  offsetMinutes: number;
  name: string;
}

export function parseTimezone(timezone: string): TimezoneInfo {
  timezone = timezone.trim().toUpperCase();

  // Handle named timezones
  if (timezone in TIMEZONE_OFFSETS) {
    return {
      offsetMinutes: TIMEZONE_OFFSETS[timezone],
      name: timezone,
    };
  }

  // Handle UTC+/-XX:XX format
  const utcPattern = /^UTC([+-])(\d{1,2}):?(\d{2})?$/;
  const utcMatch = timezone.match(utcPattern);
  if (utcMatch) {
    const [, sign, hours, minutes = '00'] = utcMatch;
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    if (hoursNum > 14 || (hoursNum === 14 && minutesNum > 0) || minutesNum >= 60) {
      throw new ValidationError('Invalid timezone offset: must be between UTC-14:00 and UTC+14:00');
    }
    
    const offsetMinutes =
      (sign === '+' ? 1 : -1) * (hoursNum * 60 + minutesNum);

    return {
      offsetMinutes,
      name: `UTC${sign}${hours.padStart(2, '0')}:${minutes}`,
    };
  }

  throw new ValidationError(
    'Invalid timezone format. Use UTC offset (e.g., UTC+01:00) or timezone name (e.g., EST)'
  );
}

export function convertToUTC(date: Date, timezone: string): Date {
  const { offsetMinutes } = parseTimezone(timezone);
  return new Date(date.getTime() - offsetMinutes * 60 * 1000);
}

export function formatWithTimezone(date: Date, timezone: string): string {
  const { offsetMinutes, name } = parseTimezone(timezone);
  const localDate = new Date(date.getTime() + offsetMinutes * 60 * 1000);

  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(localDate.getUTCDate()).padStart(2, '0');
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes} ${name}`;
} 