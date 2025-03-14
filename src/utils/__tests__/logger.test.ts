import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as core from '@actions/core';
import { logRequirements, logPrioritizedRequirements } from '../logger';
import { MergeRequirement } from '../../types';

// Mock @actions/core
vi.mock('@actions/core', () => ({
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  startGroup: vi.fn(),
  endGroup: vi.fn(),
}));

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logRequirements', () => {
    it('should log requirements from a source', () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          source: 'label',
          value: '2024-01-15',
          priority: 3,
        },
        {
          type: 'dependency',
          source: 'label',
          value: 'https://github.com/org/repo/pull/123',
          priority: 3,
        },
      ];

      logRequirements('label', requirements);

      expect(core.startGroup).toHaveBeenCalledWith('Requirements from label');
      expect(core.debug).toHaveBeenCalledWith('Found requirements:');
      expect(core.debug).toHaveBeenCalledWith(
        '- date: 2024-01-15 (priority: 3)'
      );
      expect(core.debug).toHaveBeenCalledWith(
        '- dependency: https://github.com/org/repo/pull/123 (priority: 3)'
      );
      expect(core.endGroup).toHaveBeenCalled();
    });

    it('should log when no requirements found', () => {
      logRequirements('commit', []);

      expect(core.startGroup).toHaveBeenCalledWith('Requirements from commit');
      expect(core.debug).toHaveBeenCalledWith('No requirements found in commit');
      expect(core.endGroup).toHaveBeenCalled();
    });

    it('should log validation errors', () => {
      const errors = [
        {
          source: 'label',
          value: 'invalid-date',
          message: 'Invalid date format',
        },
      ];

      logRequirements('label', [], errors);

      expect(core.warning).toHaveBeenCalledWith(
        'Found 1 invalid requirements:'
      );
      expect(core.warning).toHaveBeenCalledWith(
        '- invalid-date: Invalid date format'
      );
    });
  });

  describe('logPrioritizedRequirements', () => {
    it('should log final prioritized requirements', () => {
      const requirements: MergeRequirement[] = [
        {
          type: 'date',
          source: 'label',
          value: '2024-01-15',
          priority: 3,
        },
        {
          type: 'dependency',
          source: 'description',
          value: 'https://github.com/org/repo/pull/123',
          priority: 2,
        },
        {
          type: 'dependency',
          source: 'commit',
          value: 'https://github.com/org/repo/pull/456',
          priority: 1,
        },
      ];

      logPrioritizedRequirements(requirements);

      expect(core.startGroup).toHaveBeenCalledWith(
        'Final Requirements (After Prioritization)'
      );
      expect(core.info).toHaveBeenCalledWith(
        'Release Date: 2024-01-15 (from label)'
      );
      expect(core.info).toHaveBeenCalledWith('Dependencies (2):');
      expect(core.info).toHaveBeenCalledWith(
        '- https://github.com/org/repo/pull/123 (from description)'
      );
      expect(core.info).toHaveBeenCalledWith(
        '- https://github.com/org/repo/pull/456 (from commit)'
      );
      expect(core.endGroup).toHaveBeenCalled();
    });

    it('should handle no requirements', () => {
      logPrioritizedRequirements([]);

      expect(core.startGroup).toHaveBeenCalledWith(
        'Final Requirements (After Prioritization)'
      );
      expect(core.info).toHaveBeenCalledWith('No requirements found');
      expect(core.endGroup).toHaveBeenCalled();
    });
  });
}); 