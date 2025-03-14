import { ValidationError } from '../types';

interface DateValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateDateFormat(dateString: string): DateValidationResult {
  const result: DateValidationResult = {
    isValid: true,
    errors: [],
  };

  if (!dateString) {
    result.errors.push('Date string cannot be empty');
    result.isValid = false;
    return result;
  }

  // Check format matches our expected patterns
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
  const dateTimePattern = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(?:\s+[A-Za-z0-9+-:]+)?$/;

  if (!dateOnlyPattern.test(dateString) && !dateTimePattern.test(dateString)) {
    result.errors.push(
      'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ]'
    );
    result.isValid = false;
    return result;
  }

  try {
    // Let Date handle the actual date validation
    const { parseDate } = require('./date-parser');
    parseDate(dateString);
  } catch (error) {
    if (error instanceof ValidationError) {
      result.errors.push(error.message);
      result.isValid = false;
    }
  }

  return result;
}

export function validateDateRange(dateString: string): DateValidationResult {
  const result = validateDateFormat(dateString);
  if (!result.isValid) {
    return result;
  }

  try {
    // Just validate that the date can be parsed
    const { parseDate } = require('./date-parser');
    parseDate(dateString);
  } catch (error) {
    if (error instanceof ValidationError) {
      result.errors.push(error.message);
      result.isValid = false;
    }
  }

  return result;
} 