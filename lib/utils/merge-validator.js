"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMergeDate = validateMergeDate;
const types_1 = require("../types");
const date_parser_1 = require("./date-parser");
/**
 * Validates if a PR can be merged based on its target merge date
 * @param dateString The target merge date in YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ] format
 * @param referenceDate Optional reference date for testing (defaults to current time)
 * @returns Validation result indicating if PR can be merged
 */
function validateMergeDate(dateString, referenceDate = new Date()) {
    // If no date requirement, PR can be merged
    if (!dateString) {
        return { canMerge: true };
    }
    try {
        const { date: targetDate } = (0, date_parser_1.parseDate)(dateString);
        // Get UTC timestamps for comparison
        const now = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate(), referenceDate.getUTCHours(), referenceDate.getUTCMinutes()));
        if (targetDate > now) {
            return {
                canMerge: false,
                reason: `PR cannot be merged before ${dateString}`,
            };
        }
        return { canMerge: true };
    }
    catch (error) {
        if (error instanceof types_1.ValidationError) {
            return {
                canMerge: false,
                reason: error.message,
            };
        }
        throw error;
    }
}
