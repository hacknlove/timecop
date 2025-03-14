import * as core from '@actions/core';
import * as github from '@actions/github';
import { MergeRequirement } from '../types';

const REQUIREMENT_SECTION = '## MERGE REQUIREMENTS:';
const REQUIREMENT_PATTERNS = {
  DATE: /^\s*\*\s*after:\s*(.+)\s*$/,
  DEPENDENCY: /^\s*\*\s*merged:\s*(.+)\s*$/,
} as const;

export async function collectFromCommits(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number
): Promise<MergeRequirement[]> {
  const requirements: MergeRequirement[] = [];

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
  } catch (error) {
    core.debug(
      `Error collecting from commits: ${error instanceof Error ? error.message : String(error)}`
    );
    return [];
  }
}
