"use strict";
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
exports.collectFromCommits = collectFromCommits;
const core = __importStar(require("@actions/core"));
const REQUIREMENT_SECTION = '## MERGE REQUIREMENTS:';
const REQUIREMENT_PATTERNS = {
    DATE: /^\s*\*\s*after:\s*(.+)\s*$/,
    DEPENDENCY: /^\s*\*\s*merged:\s*(.+)\s*$/,
};
async function collectFromCommits(octokit, owner, repo, prNumber) {
    const requirements = [];
    try {
        core.debug(`Fetching commits for PR #${prNumber} from ${owner}/${repo}`);
        const { data: commits } = await octokit.rest.pulls.listCommits({
            owner,
            repo,
            pull_number: prNumber,
        });
        core.debug(`Found ${commits.length} commits in PR`);
        for (const commit of commits) {
            const message = commit.commit.message;
            core.debug(`Processing commit: ${commit.sha}`);
            core.debug(`Commit message: ${message}`);
            const sectionIndex = message.indexOf(REQUIREMENT_SECTION);
            if (sectionIndex === -1) {
                core.debug('No requirements section found in commit message');
                continue;
            }
            const requirementsContent = message
                .slice(sectionIndex + REQUIREMENT_SECTION.length)
                .split('\n')
                .filter(Boolean);
            core.debug(`Found ${requirementsContent.length} lines in requirements section`);
            for (const line of requirementsContent) {
                core.debug(`Processing line: ${line}`);
                if (line.startsWith('##')) {
                    core.debug('Found next section, stopping requirements parsing');
                    break;
                }
                const dateMatch = line.match(REQUIREMENT_PATTERNS.DATE);
                if (dateMatch) {
                    core.debug(`Found date requirement: ${dateMatch[1]}`);
                    requirements.push({
                        type: 'date',
                        source: 'commit',
                        value: dateMatch[1].trim(),
                        priority: 1,
                    });
                    continue;
                }
                const dependencyMatch = line.match(REQUIREMENT_PATTERNS.DEPENDENCY);
                if (dependencyMatch) {
                    core.debug(`Found dependency requirement: ${dependencyMatch[1]}`);
                    requirements.push({
                        type: 'dependency',
                        source: 'commit',
                        value: dependencyMatch[1].trim(),
                        priority: 1,
                    });
                }
            }
        }
        core.debug(`Collected ${requirements.length} requirements from commits`);
        return requirements;
    }
    catch (error) {
        core.debug(`Error collecting from commits: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}
