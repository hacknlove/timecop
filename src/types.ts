export interface MergeRequirement {
  type: 'date' | 'dependency';
  source: 'label' | 'description' | 'commit';
  value: string;
  priority: number; // Higher number = higher priority
}

export interface DateRequirement {
  type: 'date';
  datetime: Date;
  source: 'label' | 'description' | 'commit';
}

export interface DependencyRequirement {
  type: 'dependency';
  url: string;
  owner: string;
  repo: string;
  pullNumber: number;
  source: 'label' | 'description' | 'commit';
}

export interface ValidationResult {
  canMerge: boolean;
  reasons: string[];
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
