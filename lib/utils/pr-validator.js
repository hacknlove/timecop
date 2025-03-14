"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRValidator = void 0;
exports.parsePRUrl = parsePRUrl;
const types_1 = require("../types");
const github_client_1 = require("./github-client");
/**
 * Parses a GitHub PR URL into its components
 * Example URL: https://github.com/owner/repo/pull/123
 */
function parsePRUrl(prUrl) {
    // Non-escaped forward slashes in regex for better readability
    const prPattern = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/;
    const match = prUrl.match(prPattern);
    if (!match) {
        throw new types_1.ValidationError('Invalid PR URL format. Expected: https://github.com/owner/repo/pull/123');
    }
    const [, owner, repo, prNumber] = match;
    return {
        owner,
        repo,
        number: parseInt(prNumber, 10),
    };
}
/**
 * Validates PR existence and status
 * Works with both public and private repositories
 */
class PRValidator {
    client;
    constructor(token) {
        this.client = new github_client_1.GitHubClient(token);
    }
    /**
     * Validates if a PR exists and is accessible
     * @param prUrl GitHub PR URL
     * @returns Validation result
     */
    async validatePRExists(prUrl) {
        try {
            const pr = parsePRUrl(prUrl);
            const prDetails = await this.client.getPR(pr.owner, pr.repo, pr.number);
            if (prDetails.state === 'closed' && !prDetails.merged) {
                return {
                    canMerge: false,
                    reason: `PR ${prUrl} is closed without being merged`,
                };
            }
            if (prDetails.draft) {
                return {
                    canMerge: false,
                    reason: `PR ${prUrl} is in draft state`,
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
}
exports.PRValidator = PRValidator;
