"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.compareDates = compareDates;
exports.formatDate = formatDate;
const types_1 = require("../types");
/**
 * Parses a date string in YYYY-MM-DD or YYYY-MM-DD HH:MM format
 * All dates are handled in UTC
 *
 * @param dateString Date string to parse
 * @returns Object containing parsed Date and whether it includes time
 * @throws ValidationError if date format or values are invalid
 */
function parseDate(dateString) {
    const trimmedDate = dateString.trim();
    // Try parsing with time (YYYY-MM-DD HH:MM)
    const fullPattern = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?:\s+([A-Za-z0-9+-:]+))?$/;
    const fullMatch = trimmedDate.match(fullPattern);
    if (fullMatch) {
        const [, yearStr, monthStr, dayStr, hoursStr, minutesStr] = fullMatch;
        const [year, month, day, hours, minutes] = [
            yearStr,
            monthStr,
            dayStr,
            hoursStr,
            minutesStr,
        ].map(Number);
        // Validate ranges before creating Date object
        if (month < 1 || month > 12)
            throw new types_1.ValidationError('Month must be between 1 and 12');
        if (day < 1 || day > 31)
            throw new types_1.ValidationError('Day must be between 1 and 31');
        if (hours < 0 || hours > 23)
            throw new types_1.ValidationError('Hours must be between 0 and 23');
        if (minutes < 0 || minutes > 59)
            throw new types_1.ValidationError('Minutes must be between 0 and 59');
        // Create date in UTC and validate it's valid
        const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        if (date.getUTCMonth() !== month - 1) {
            throw new types_1.ValidationError('Invalid date for the given month');
        }
        return { date, hasTime: true };
    }
    // Try parsing date only (YYYY-MM-DD)
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    const dateMatch = trimmedDate.match(datePattern);
    if (dateMatch) {
        const [, yearStr, monthStr, dayStr] = dateMatch;
        const [year, month, day] = [yearStr, monthStr, dayStr].map(Number);
        // Validate ranges
        if (month < 1 || month > 12)
            throw new types_1.ValidationError('Month must be between 1 and 12');
        if (day < 1 || day > 31)
            throw new types_1.ValidationError('Day must be between 1 and 31');
        // Create date and validate it's valid
        const date = new Date(Date.UTC(year, month - 1, day));
        if (date.getUTCMonth() !== month - 1) {
            throw new types_1.ValidationError('Invalid date for the given month');
        }
        return { date, hasTime: false };
    }
    throw new types_1.ValidationError('Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ]');
}
function compareDates(date, reference = new Date()) {
    return date <= reference;
}
function formatDate(date, includeTime = false) {
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
