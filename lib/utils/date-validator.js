"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateFormat = validateDateFormat;
exports.validateDateRange = validateDateRange;
const types_1 = require("../types");
const date_parser_1 = require("./date-parser");
function validateDateFormat(dateString) {
    const result = {
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
        result.errors.push('Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM [TZ]');
        result.isValid = false;
        return result;
    }
    try {
        // Let Date handle the actual date validation
        (0, date_parser_1.parseDate)(dateString);
    }
    catch (error) {
        if (error instanceof types_1.ValidationError) {
            result.errors.push(error.message);
            result.isValid = false;
        }
    }
    return result;
}
function validateDateRange(dateString) {
    const result = validateDateFormat(dateString);
    if (!result.isValid) {
        return result;
    }
    try {
        // Just validate that the date can be parsed
        (0, date_parser_1.parseDate)(dateString);
    }
    catch (error) {
        if (error instanceof types_1.ValidationError) {
            result.errors.push(error.message);
            result.isValid = false;
        }
    }
    return result;
}
