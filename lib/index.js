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
const label_1 = require("./collectors/label");
const description_1 = require("./collectors/description");
const commit_1 = require("./collectors/commit");
const priority_1 = require("./utils/priority");
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
        core.debug('Starting TimeCop action');
        const token = core.getInput('github-token', { required: true });
        const octokit = github.getOctokit(token);
        const context = github.context;
        core.debug(`Context: ${JSON.stringify(context, null, 2)}`);
        if (!context.payload.pull_request) {
            core.setFailed('This action can only be run on pull requests');
            return;
        }
        const { owner, repo } = context.repo;
        const prNumber = context.payload.pull_request.number;
        core.debug(`Processing PR #${prNumber} from ${owner}/${repo}`);
        // Collect requirements from all sources
        core.debug('Collecting requirements from labels...');
        const labelRequirements = await (0, label_1.collectFromLabels)(octokit, owner, repo, prNumber);
        core.debug(`Found ${labelRequirements.length} requirements in labels`);
        core.debug('Collecting requirements from description...');
        const descriptionRequirements = await (0, description_1.collectFromDescription)(octokit, owner, repo, prNumber);
        core.debug(`Found ${descriptionRequirements.length} requirements in description`);
        core.debug('Collecting requirements from commits...');
        const commitRequirements = await (0, commit_1.collectFromCommits)(octokit, owner, repo, prNumber);
        core.debug(`Found ${commitRequirements.length} requirements in commits`);
        // Combine and prioritize requirements
        const allRequirements = [
            ...labelRequirements,
            ...descriptionRequirements,
            ...commitRequirements,
        ];
        core.debug(`Total requirements found: ${allRequirements.length}`);
        core.debug(`Requirements before prioritization: ${JSON.stringify(allRequirements, null, 2)}`);
        const prioritizedRequirements = (0, priority_1.prioritizeRequirements)(allRequirements);
        core.debug(`Prioritized requirements: ${JSON.stringify(prioritizedRequirements, null, 2)}`);
        // Log requirements for debugging
        core.startGroup('Final Requirements (After Prioritization)');
        if (prioritizedRequirements.length === 0) {
            core.info('No requirements found');
        }
        else {
            const dateReq = prioritizedRequirements.find((req) => req.type === 'date');
            const dependencyReqs = prioritizedRequirements.filter((req) => req.type === 'dependency');
            if (dateReq) {
                core.info(`Release Date: ${dateReq.value} (from ${dateReq.source})`);
            }
            if (dependencyReqs.length > 0) {
                core.info(`Dependencies (${dependencyReqs.length}):`);
                dependencyReqs.forEach((req) => {
                    core.info(`- ${req.value} (from ${req.source})`);
                });
            }
        }
        core.endGroup();
        const validationResult = await validatePullRequest(octokit, prioritizedRequirements);
        if (!validationResult.canMerge) {
            core.setFailed(validationResult.reasons.join('\n'));
        }
    }
    catch (error) {
        core.debug(`Error in action: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
    }
}
run();
