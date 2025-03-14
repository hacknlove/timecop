/* eslint-disable @typescript-eslint/no-unused-vars */

import * as core from '@actions/core';
import * as github from '@actions/github';
import { parsePullRequestUrl } from './utils/url-parser';
import { MergeRequirement, ValidationResult } from './types';
import { collectFromLabels, collectFromDescription, collectFromCommits } from './collectors';
import { prioritizeRequirements } from './utils/priority';
import { logPrioritizedRequirements } from './utils/logger';

// TODO: Use these priority values when implementing requirement collection
// eslint-disable-next-line
const PRIORITY = {
  LABEL: 3,
  DESCRIPTION: 2,
  COMMIT: 1,
} as const;

async function validatePullRequest(
  octokit: ReturnType<typeof github.getOctokit>,
  requirements: MergeRequirement[]
): Promise<ValidationResult> {
  const result: ValidationResult = {
    canMerge: true,
    reasons: [],
  };

  // Group requirements by type
  const dateReqs = requirements.filter((req) => req.type === 'date');
  const dependencyReqs = requirements.filter((req) => req.type === 'dependency');

  // For dates, we only care about the highest priority one
  if (dateReqs.length > 0) {
    // TODO: Implement date validation
    // eslint-disable-next-line
    const _highestPriorityDate = dateReqs.reduce((prev, current) =>
      current.priority > prev.priority ? current : prev
    );
  }

  // For dependencies, we combine all of them
  for (const dep of dependencyReqs) {
    try {
      // TODO: Implement dependency validation
      const {
        owner: _owner,
        repo: _repo,
        pullNumber: _pullNumber,
      } = parsePullRequestUrl(dep.value);
      // Will be used when implementing PR status check
    } catch (error) {
      if (error instanceof Error) {
        result.reasons.push(error.message);
        result.canMerge = false;
      }
    }
  }

  return result;
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit(token);

    const context = github.context;
    if (!context.payload.pull_request) {
      core.setFailed('This action can only be run on pull requests');
      return;
    }

    // Collect requirements from all sources
    const labelRequirements = await collectFromLabels(
      octokit,
      context.repo.owner,
      context.repo.repo,
      context.payload.pull_request.number
    );
    
    const descriptionRequirements = await collectFromDescription(
      octokit,
      context.repo.owner,
      context.repo.repo,
      context.payload.pull_request.number
    );
    
    const commitRequirements = await collectFromCommits(
      octokit,
      context.repo.owner,
      context.repo.repo,
      context.payload.pull_request.number
    );

    // Combine and prioritize requirements
    const allRequirements = [
      ...labelRequirements,
      ...descriptionRequirements,
      ...commitRequirements
    ];
    
    const prioritizedRequirements = prioritizeRequirements(allRequirements);
    
    // Log requirements for debugging
    logPrioritizedRequirements(prioritizedRequirements);

    const validationResult = await validatePullRequest(octokit, prioritizedRequirements);

    if (!validationResult.canMerge) {
      core.setFailed(validationResult.reasons.join('\n'));
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
