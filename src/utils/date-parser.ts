import { ValidationError } from '../types';

interface ParsedDate {
  date: Date;
  hasTime: boolean;
}

export function parseDate(dateString: string): ParsedDate {
  const trimmedDate = dateString.trim();
  
  // Try parsing with time (YYYY-MM-DD HH:MM)
  const fullPattern = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/;
  const fullMatch = trimmedDate.match(fullPattern);
  
  if (fullMatch) {
    const [, yearStr, monthStr, dayStr, hoursStr, minutesStr] = fullMatch;
    const [year, month, day, hours, minutes] = [yearStr, monthStr, dayStr, hoursStr, minutesStr]
      .map(Number);
    
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    
    // Validate the parsed values match the input (catches invalid dates like 2024-02-31)
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day &&
      date.getUTCHours() === hours &&
      date.getUTCMinutes() === minutes
    ) {
      return { date, hasTime: true };
    }
    
    throw new ValidationError('Invalid date/time values');
  }
  
  // Try parsing date only (YYYY-MM-DD)
  const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dateMatch = trimmedDate.match(datePattern);
  
  if (dateMatch) {
    const [, yearStr, monthStr, dayStr] = dateMatch;
    const [year, month, day] = [yearStr, monthStr, dayStr].map(Number);
    
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Validate the parsed values match the input
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return { date, hasTime: false };
    }
    
    throw new ValidationError('Invalid date values');
  }
  
  throw new ValidationError(
    'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM'
  );
}

export function compareDates(date: Date, reference: Date = new Date()): boolean {
  return date <= reference;
}

export function formatDate(date: Date, includeTime: boolean = false): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  if (!includeTime) {
    return `${year}-${month}-${day}`;
  }
  
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
} 