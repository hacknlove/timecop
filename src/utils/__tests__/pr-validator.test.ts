import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PRValidator, parsePRUrl } from '../pr-validator';
import { ValidationError } from '../../types';

vi.mock('../github-client', () => ({
  GitHubClient: class MockGitHubClient {
    async getPR(owner: string, repo: string, prNumber: number) {
      if (owner === 'error') throw new ValidationError('PR not found');
      
      return {
        number: prNumber,
        state: owner === 'closed' ? 'closed' : 'open',
        merged: owner === 'merged',
        mergeable: true,
        draft: owner === 'draft'
      };
    }
  }
}));

describe('PR Validator', () => {
  let validator: PRValidator;

  beforeEach(() => {
    validator = new PRValidator('fake-token');
  });

  describe('parsePRUrl', () => {
    it('should parse valid PR URL', () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const result = parsePRUrl(url);
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        number: 123
      });
    });

    it('should reject invalid PR URL format', () => {
      const invalidUrls = [
        'not-a-url',
        'http://github.com/owner/repo/pull/123',
        'https://github.com/owner/repo/pulls/123',
        'https://github.com/owner/repo/123',
        'https://github.com/owner/pull/123',
      ];

      invalidUrls.forEach(url => {
        expect(() => parsePRUrl(url)).toThrow(ValidationError);
      });
    });
  });

  describe('validatePRExists', () => {
    it('should validate existing PR', async () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(true);
    });

    it('should reject non-existent PR', async () => {
      const url = 'https://github.com/error/repo/pull/123';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toBe('PR not found');
    });

    it('should reject closed PR', async () => {
      const url = 'https://github.com/closed/repo/pull/123';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toContain('closed without being merged');
    });

    it('should reject draft PR', async () => {
      const url = 'https://github.com/draft/repo/pull/123';
      const result = await validator.validatePRExists(url);
      expect(result.canMerge).toBe(false);
      expect(result.reason).toContain('draft state');
    });
  });
}); 