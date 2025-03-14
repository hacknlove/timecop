"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = exports.RateLimitError = void 0;
const rest_1 = require("@octokit/rest");
const types_1 = require("../types");
const cache_1 = require("./cache");
class RateLimitError extends Error {
    resetAt;
    remaining;
    constructor(message, resetAt, remaining) {
        super(message);
        this.resetAt = resetAt;
        this.remaining = remaining;
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Handles all GitHub API interactions with proper error handling and rate limiting
 * Can work with or without authentication token
 */
class GitHubClient {
    octokit;
    cache;
    // Cache TTLs in milliseconds
    static TTL = {
        MERGED: 5 * 60 * 1000, // 5 minutes for merged PRs
        CLOSED: 60 * 1000, // 1 minute for closed PRs
        DEFAULT: 30 * 1000, // 30 seconds for open PRs
    };
    // Rate limit retry settings
    static RETRY = {
        MAX_ATTEMPTS: 3,
        BASE_DELAY: 1000, // Start with 1 second delay
        MAX_DELAY: 10000, // Max 10 second delay
    };
    /**
     * @param token Optional GitHub token. If not provided, works with public repos only
     */
    constructor(token) {
        this.octokit = new rest_1.Octokit(token ? { auth: token } : {});
        this.cache = new cache_1.Cache(GitHubClient.TTL.DEFAULT);
    }
    /**
     * Fetches PR information from GitHub with rate limit handling
     * @throws ValidationError if PR not found
     * @throws RateLimitError if rate limit is nearly exhausted
     * @throws Error for other API errors (rate limits, network issues, etc)
     */
    async getPR(owner, repo, number) {
        const cacheKey = `${owner}/${repo}#${number}`;
        // Try cache first
        const cached = this.cache.get(cacheKey);
        if (cached)
            return cached;
        let attempt = 0;
        while (attempt < GitHubClient.RETRY.MAX_ATTEMPTS) {
            try {
                const response = await this.octokit.rest.pulls.get({
                    owner,
                    repo,
                    pull_number: number,
                });
                // Check remaining rate limit
                const remaining = parseInt(response.headers['x-ratelimit-remaining'], 10);
                const resetAt = new Date(parseInt(response.headers['x-ratelimit-reset'], 10) * 1000);
                if (remaining <= 1) {
                    // Throw rate limit error but cache the response first
                    const prData = {
                        number: response.data.number,
                        state: response.data.state,
                        merged: response.data.merged ?? false,
                        mergeable: response.data.mergeable,
                        draft: response.data.draft ?? false,
                    };
                    const ttl = prData.merged
                        ? GitHubClient.TTL.MERGED
                        : prData.state === 'closed'
                            ? GitHubClient.TTL.CLOSED
                            : GitHubClient.TTL.DEFAULT;
                    this.cache.set(cacheKey, prData, ttl);
                    throw new RateLimitError(`Rate limit nearly exhausted (${remaining} remaining). Resets at ${resetAt.toISOString()}`, resetAt, remaining);
                }
                // Extract and cache PR data
                const prData = {
                    number: response.data.number,
                    state: response.data.state,
                    merged: response.data.merged ?? false,
                    mergeable: response.data.mergeable,
                    draft: response.data.draft ?? false,
                };
                const ttl = prData.merged
                    ? GitHubClient.TTL.MERGED
                    : prData.state === 'closed'
                        ? GitHubClient.TTL.CLOSED
                        : GitHubClient.TTL.DEFAULT;
                this.cache.set(cacheKey, prData, ttl);
                return prData;
            }
            catch (error) {
                if (error instanceof RateLimitError)
                    throw error;
                if (error instanceof Error && 'status' in error) {
                    const httpError = error;
                    if (httpError.status === 404) {
                        throw new types_1.ValidationError(`PR not found: ${cacheKey}`);
                    }
                    if (httpError.status === 403) {
                        const resetAt = new Date(parseInt(httpError.headers?.['x-ratelimit-reset'], 10) * 1000);
                        throw new RateLimitError(`Rate limit exceeded. Resets at ${resetAt.toISOString()}`, resetAt, 0);
                    }
                }
                // For other errors, implement exponential backoff
                attempt++;
                if (attempt === GitHubClient.RETRY.MAX_ATTEMPTS)
                    throw error;
                const delay = Math.min(GitHubClient.RETRY.BASE_DELAY * Math.pow(2, attempt), GitHubClient.RETRY.MAX_DELAY);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error('Maximum retry attempts reached');
    }
    /**
     * Cleans up expired cache entries
     */
    cleanupCache() {
        this.cache.cleanup();
    }
}
exports.GitHubClient = GitHubClient;
