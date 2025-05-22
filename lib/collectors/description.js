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
exports.collectFromDescription = collectFromDescription;
const core = __importStar(require("@actions/core"));
const REQUIREMENT_SECTION = '## MERGE REQUIREMENTS:';
const REQUIREMENT_PATTERNS = {
    LINE: /^\s*\*\s*after:\s*(.+)\s*$/,
    TAG: /\[after:\s*(.+?)\]/g,
};
async function collectFromDescription(octokit, owner, repo, prNumber) {
    const requirements = [];
    try {
        core.debug(`Fetching PR #${prNumber} from ${owner}/${repo}`);
        // Get PR description
        const { data: pullRequest } = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
        });
        core.debug(`PR Description: ${pullRequest.body || '(empty)'}`);
        const description = pullRequest.body || '';
        // First, collect all tag-based requirements from the entire description
        const tagMatches = description.matchAll(REQUIREMENT_PATTERNS.TAG);
        for (const match of tagMatches) {
            const value = match[1].trim();
            core.debug(`Found tag requirement: ${value}`);
            // Check if the value is a PR URL
            if (value.includes('github.com')) {
                requirements.push({
                    type: 'dependency',
                    source: 'description',
                    value,
                    priority: 2,
                });
            }
            else {
                // Assume it's a date
                requirements.push({
                    type: 'date',
                    source: 'description',
                    value,
                    priority: 2,
                });
            }
        }
        // Then process the requirements section if it exists
        const sectionIndex = description.indexOf(REQUIREMENT_SECTION);
        if (sectionIndex === -1) {
            core.debug('No requirements section found in PR description');
            return requirements;
        }
        // Get content after the section header
        const requirementsContent = description
            .slice(sectionIndex + REQUIREMENT_SECTION.length)
            .split('\n')
            .filter(Boolean); // Remove empty lines
        core.debug(`Found ${requirementsContent.length} lines in requirements section`);
        // Process each line
        for (const line of requirementsContent) {
            core.debug(`Processing line: ${line}`);
            // Stop if we hit another section
            if (line.startsWith('##')) {
                core.debug('Found next section, stopping requirements parsing');
                break;
            }
            // Check for requirement
            const match = line.match(REQUIREMENT_PATTERNS.LINE);
            if (match) {
                const value = match[1].trim();
                core.debug(`Found requirement: ${value}`);
                // Check if the value is a PR URL
                if (value.includes('github.com')) {
                    requirements.push({
                        type: 'dependency',
                        source: 'description',
                        value,
                        priority: 2,
                    });
                }
                else {
                    // Assume it's a date
                    requirements.push({
                        type: 'date',
                        source: 'description',
                        value,
                        priority: 2,
                    });
                }
            }
        }
        core.debug(`Collected ${requirements.length} requirements from description`);
        return requirements;
    }
    catch (error) {
        core.debug(`Error collecting from description: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}
