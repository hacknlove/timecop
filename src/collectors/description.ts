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
    // Get PR description
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    const description = pullRequest.body || '';

    // Find requirements section
    const sectionIndex = description.indexOf(REQUIREMENT_SECTION);
    if (sectionIndex === -1) {
      return requirements;
    }

    // Get content after the section header
    const requirementsContent = description
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
          source: 'description',
          value: dateMatch[1].trim(),
          priority: 2, // Medium priority
        });
        continue;
      }

      // Check for dependency requirement
      const dependencyMatch = line.match(REQUIREMENT_PATTERNS.DEPENDENCY);
      if (dependencyMatch) {
        requirements.push({
          type: 'dependency',
          source: 'description',
          value: dependencyMatch[1].trim(),
          priority: 2,
        });
      }
    }

    return requirements;
  } catch (error) {
    // If we can't get PR description, return empty array
    return [];
  }
} 