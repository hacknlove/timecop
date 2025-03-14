"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectFromCommits = collectFromCommits;
const REQUIREMENT_SECTION = '## MERGE REQUIREMENTS:';
const REQUIREMENT_PATTERNS = {
    DATE: /^\s*\*\s*after:\s*(.+)\s*$/,
    DEPENDENCY: /^\s*\*\s*merged:\s*(.+)\s*$/,
};
async function collectFromCommits(octokit, owner, repo, prNumber) {
    const requirements = [];
    try {
        // Get all commits in the PR
        const { data: commits } = await octokit.rest.pulls.listCommits({
            owner,
            repo,
            pull_number: prNumber,
        });
        // Process each commit message
        for (const commit of commits) {
            const message = commit.commit.message;
            const sectionIndex = message.indexOf(REQUIREMENT_SECTION);
            if (sectionIndex === -1) {
                continue;
            }
            // Get content after the section header
            const requirementsContent = message
                .slice(sectionIndex + REQUIREMENT_SECTION.length)
                .split('\n')
                .filter(Boolean); // Remove empty lines
            // Process each line
            for (const line of requirementsContent) {
                // Stop if we hit another section
                if (line.startsWith('##')) {
                    break;
                }
                // Check for date requirement
                const dateMatch = line.match(REQUIREMENT_PATTERNS.DATE);
                if (dateMatch) {
                    requirements.push({
                        type: 'date',
                        source: 'commit',
                        value: dateMatch[1].trim(),
                        priority: 1, // Lowest priority
                    });
                    continue;
                }
                // Check for dependency requirement
                const dependencyMatch = line.match(REQUIREMENT_PATTERNS.DEPENDENCY);
                if (dependencyMatch) {
                    requirements.push({
                        type: 'dependency',
                        source: 'commit',
                        value: dependencyMatch[1].trim(),
                        priority: 1,
                    });
                }
            }
        }
        return requirements;
    }
    catch {
        // If we can't get commits, return empty array
        return [];
    }
}
