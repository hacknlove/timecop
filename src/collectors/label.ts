import * as github from '@actions/github';
import { MergeRequirement } from '../types';

const REQUIREMENT_LABELS = {
  DATE: 'after:',
  DEPENDENCY: 'merged:',
} as const;

export async function collectFromLabels(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number
): Promise<MergeRequirement[]> {
  const requirements: MergeRequirement[] = [];

  try {
    // Get all labels from the PR
    const { data: labels } = await octokit.rest.issues.listLabelsOnIssue({
      owner,
      repo,
      issue_number: prNumber,
    });

    // Process each label
    labels.forEach((label) => {
      const name = label.name.trim();

      // Check for date requirement
      if (name.startsWith(REQUIREMENT_LABELS.DATE)) {
        requirements.push({
          type: 'date',
          source: 'label',
          value: name.substring(REQUIREMENT_LABELS.DATE.length).trim(),
          priority: 3, // Highest priority
        });
      }

      // Check for dependency requirement
      if (name.startsWith(REQUIREMENT_LABELS.DEPENDENCY)) {
        requirements.push({
          type: 'dependency',
          source: 'label',
          value: name.substring(REQUIREMENT_LABELS.DEPENDENCY.length).trim(),
          priority: 3,
        });
      }
    });

    return requirements;
  } catch {
    // If we can't get labels, return empty array
    // The action will continue with other collectors
    return [];
  }
}
