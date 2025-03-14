import { ValidationError } from '../types';
import { parseDate } from './date-parser';

export interface MergeValidationResult {
  canMerge: boolean;
  reason?: string;
}

/**
 * Validates if a PR can be merged based on its target merge date
 * @param dateString The target merge date in YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ] format
 * @param referenceDate Optional reference date for testing (defaults to current time)
 * @returns Validation result indicating if PR can be merged
 */
export function validateMergeDate(
  dateString: string | undefined,
  referenceDate: Date = new Date()
): MergeValidationResult {
  // If no date requirement, PR can be merged
  if (!dateString) {
    return { canMerge: true };
  }

  try {
    const { date: targetDate } = parseDate(dateString);

    // Get UTC timestamps for comparison
    const now = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
        referenceDate.getUTCHours(),
        referenceDate.getUTCMinutes()
      )
    );

    if (targetDate > now) {
      return {
        canMerge: false,
        reason: `PR cannot be merged before ${dateString}`,
      };
    }

    return { canMerge: true };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        canMerge: false,
        reason: error.message,
      };
    }
    throw error;
  }
}
