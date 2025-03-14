"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidPullRequestURLError = void 0;
exports.parsePullRequestUrl = parsePullRequestUrl;
class InvalidPullRequestURLError extends Error {
    constructor(url) {
        super(`Invalid pull request URL: ${url}`);
    }
}
exports.InvalidPullRequestURLError = InvalidPullRequestURLError;
function parsePullRequestUrl(url) {
    try {
        const urlObj = new URL(url);
        if (!urlObj.hostname.endsWith('github.com')) {
            throw new InvalidPullRequestURLError(url);
        }
        const parts = urlObj.pathname.split('/');
        // Expected format: /:owner/:repo/pull/:number
        if (parts.length !== 5 || parts[3] !== 'pull') {
            throw new InvalidPullRequestURLError(url);
        }
        const [, owner, repo, , pullNumberStr] = parts;
        const pullNumber = parseInt(pullNumberStr, 10);
        if (isNaN(pullNumber)) {
            throw new InvalidPullRequestURLError(url);
        }
        return {
            owner,
            repo,
            pullNumber,
        };
    }
    catch {
        throw new InvalidPullRequestURLError(url);
    }
}
