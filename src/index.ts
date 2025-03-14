/* eslint-disable @typescript-eslint/no-unused-vars */

import * as core from '@actions/core';
import * as github from '@actions/github';
import { parsePullRequestUrl } from './utils/url-parser';
import { MergeRequirement, ValidationResult } from './types';
import { collectFromLabels } from './collectors/label';
import { collectFromDescription } from './collectors/description';
import { collectFromCommits } from './collectors/commit';
import { prioritizeRequirements } from './utils/priority';
import { logPrioritizedRequirements } from './utils/logger';

// TODO: Use these priority values when implementing requirement collection
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
    const labelRequirements = await collectFromLabels(octokit, owner, repo, prNumber);
    core.debug(`Found ${labelRequirements.length} requirements in labels`);

    core.debug('Collecting requirements from description...');
    const descriptionRequirements = await collectFromDescription(octokit, owner, repo, prNumber);
    core.debug(`Found ${descriptionRequirements.length} requirements in description`);

    core.debug('Collecting requirements from commits...');
    const commitRequirements = await collectFromCommits(octokit, owner, repo, prNumber);
    core.debug(`Found ${commitRequirements.length} requirements in commits`);

    // Combine and prioritize requirements
    const allRequirements = [
      ...labelRequirements,
      ...descriptionRequirements,
      ...commitRequirements,
    ];

    core.debug(`Total requirements found: ${allRequirements.length}`);
    core.debug(`Requirements before prioritization: ${JSON.stringify(allRequirements, null, 2)}`);

    const prioritizedRequirements = prioritizeRequirements(allRequirements);
    core.debug(`Prioritized requirements: ${JSON.stringify(prioritizedRequirements, null, 2)}`);

    // Log requirements for debugging
    core.startGroup('Final Requirements (After Prioritization)');
    if (prioritizedRequirements.length === 0) {
      core.info('No requirements found');
    } else {
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
  } catch (error) {
    core.debug(`Error in action: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
