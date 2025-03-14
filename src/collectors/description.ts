import * as core from '@actions/core';
import * as github from '@actions/github';
import { MergeRequirement } from '../types';

const REQUIREMENT_SECTION = '## MERGE REQUIREMENTS:';
const REQUIREMENT_PATTERNS = {
  DATE: /^\s*\*\s*after:\s*(.+)\s*$/,
  DEPENDENCY: /^\s*\*\s*merged:\s*(.+)\s*$/,
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

    // Find requirements section
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

      // Check for date requirement
      const dateMatch = line.match(REQUIREMENT_PATTERNS.DATE);
      if (dateMatch) {
        core.debug(`Found date requirement: ${dateMatch[1]}`);
        requirements.push({
          type: 'date',
          source: 'description',
          value: dateMatch[1].trim(),
          priority: 2,
        });
        continue;
      }

      // Check for dependency requirement
      const dependencyMatch = line.match(REQUIREMENT_PATTERNS.DEPENDENCY);
      if (dependencyMatch) {
        core.debug(`Found dependency requirement: ${dependencyMatch[1]}`);
        requirements.push({
          type: 'dependency',
          source: 'description',
          value: dependencyMatch[1].trim(),
          priority: 2,
        });
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
