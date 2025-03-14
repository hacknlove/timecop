import { Octokit } from '@octokit/rest';
import { jest } from '@jest/globals';

declare global {
  const jest: typeof import('@jest/globals')['jest'];
  const describe: typeof import('@jest/globals')['describe'];
  const it: typeof import('@jest/globals')['it'];
  const expect: typeof import('@jest/globals')['expect'];
  const beforeEach: typeof import('@jest/globals')['beforeEach'];
}

declare module '@octokit/rest' {
  interface Octokit {
    rest: {
      issues: {
        listLabelsOnIssue: jest.Mock;
      };
    };
  }
} 