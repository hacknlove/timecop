import { MergeRequirement } from '../types';

interface ValidationError {
  source: string;
  value: string;
  message: string;
}

export function validateRequirements(requirements: MergeRequirement[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const req of requirements) {
    if (req.type === 'date') {
      const dateErrors = validateDateRequirement(req);
      errors.push(...dateErrors);
    } else if (req.type === 'dependency') {
      const dependencyErrors = validateDependencyRequirement(req);
      errors.push(...dependencyErrors);
    }
  }

  return errors;
}

function validateDateRequirement(req: MergeRequirement): ValidationError[] {
  const errors: ValidationError[] = [];
  const dateValue = req.value.trim();

  // Check basic date format (YYYY-MM-DD or YYYY-MM-DD HH:MM)
  const dateRegex = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2})?$/;
  if (!dateRegex.test(dateValue)) {
    errors.push({
      source: req.source,
      value: dateValue,
      message: 'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM',
    });
    return errors;
  }

  // Check if it's a valid date
  const [datePart, timePart] = dateValue.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    errors.push({
      source: req.source,
      value: dateValue,
      message: 'Invalid date values',
    });
  }

  // Check time part if present
  if (timePart) {
    const [hours, minutes] = timePart.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      errors.push({
        source: req.source,
        value: dateValue,
        message: 'Invalid time values',
      });
    }
  }

  return errors;
}

function validateDependencyRequirement(req: MergeRequirement): ValidationError[] {
  const errors: ValidationError[] = [];
  const urlValue = req.value.trim();

  // Basic GitHub PR URL validation
  const urlRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;
  if (!urlRegex.test(urlValue)) {
    errors.push({
      source: req.source,
      value: urlValue,
      message: 'Invalid GitHub PR URL format',
    });
  }

  return errors;
}
