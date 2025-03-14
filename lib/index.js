"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const url_parser_1 = require("./utils/url-parser");
const collectors_1 = require("./collectors");
const priority_1 = require("./utils/priority");
const logger_1 = require("./utils/logger");
// TODO: Use these priority values when implementing requirement collection
const PRIORITY = {
    LABEL: 3,
    DESCRIPTION: 2,
    COMMIT: 1,
};
async function validatePullRequest(octokit, requirements) {
    const result = {
        canMerge: true,
        reasons: [],
    };
    // Group requirements by type
    const dateReqs = requirements.filter((req) => req.type === 'date');
    const dependencyReqs = requirements.filter((req) => req.type === 'dependency');
    // For dates, we only care about the highest priority one
    if (dateReqs.length > 0) {
        // TODO: Implement date validation
        const _highestPriorityDate = dateReqs.reduce((prev, current) => current.priority > prev.priority ? current : prev);
    }
    // For dependencies, we combine all of them
    for (const dep of dependencyReqs) {
        try {
            // TODO: Implement dependency validation
            const { owner: _owner, repo: _repo, pullNumber: _pullNumber, } = (0, url_parser_1.parsePullRequestUrl)(dep.value);
            // Will be used when implementing PR status check
        }
        catch (error) {
            if (error instanceof Error) {
                result.reasons.push(error.message);
                result.canMerge = false;
            }
        }
    }
    return result;
}
async function run() {
    try {
        const token = core.getInput('github-token', { required: true });
        const octokit = github.getOctokit(token);
        const context = github.context;
        if (!context.payload.pull_request) {
            core.setFailed('This action can only be run on pull requests');
            return;
        }
        // Collect requirements from all sources
        const labelRequirements = await (0, collectors_1.collectFromLabels)(octokit, context.repo.owner, context.repo.repo, context.payload.pull_request.number);
        const descriptionRequirements = await (0, collectors_1.collectFromDescription)(octokit, context.repo.owner, context.repo.repo, context.payload.pull_request.number);
        const commitRequirements = await (0, collectors_1.collectFromCommits)(octokit, context.repo.owner, context.repo.repo, context.payload.pull_request.number);
        // Combine and prioritize requirements
        const allRequirements = [
            ...labelRequirements,
            ...descriptionRequirements,
            ...commitRequirements,
        ];
        const prioritizedRequirements = (0, priority_1.prioritizeRequirements)(allRequirements);
        // Log requirements for debugging
        (0, logger_1.logPrioritizedRequirements)(prioritizedRequirements);
        const validationResult = await validatePullRequest(octokit, prioritizedRequirements);
        if (!validationResult.canMerge) {
            core.setFailed(validationResult.reasons.join('\n'));
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}
run();
