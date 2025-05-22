import * as core from '@actions/core';
import * as github from '@actions/github';
import { MergeRequirement } from '../types';

const REQUIREMENT_SECTION = '## MERGE REQUIREMENTS:';
const REQUIREMENT_PATTERNS = {
  LINE: /^\s*\*\s*after:\s*(.+)\s*$/,
  TAG: /\[after:\s*(.+?)\]/g,
} as const;

export async function collectFromDescription(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number
): Promise<MergeRequirement[]> {
  const requirements: MergeRequirement[] = [];

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
      } else {
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
        } else {
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
  } catch (error) {
    core.debug(
      `Error collecting from description: ${error instanceof Error ? error.message : String(error)}`
    );
    return [];
  }
}
