import * as core from '@actions/core';
import { MergeRequirement } from '../types';

export function logRequirements(
  source: string,
  requirements: MergeRequirement[],
  errors: Array<{ source: string; value: string; message: string }> = []
): void {
  core.startGroup(`Requirements from ${source}`);

  if (requirements.length === 0 && errors.length === 0) {
    core.debug(`No requirements found in ${source}`);
    core.endGroup();
    return;
  }

  // Log valid requirements
  if (requirements.length > 0) {
    core.debug('Found requirements:');
    requirements.forEach((req) => {
      core.debug(`- ${req.type}: ${req.value} (priority: ${req.priority})`);
    });
  }

  // Log errors if any
  if (errors.length > 0) {
    core.warning(`Found ${errors.length} invalid requirements:`);
    errors.forEach((error) => {
      core.warning(`- ${error.value}: ${error.message}`);
    });
  }

  core.endGroup();
}

export function logPrioritizedRequirements(requirements: MergeRequirement[]): void {
  core.startGroup('Final Requirements (After Prioritization)');

  const dateReq = requirements.find((req) => req.type === 'date');
  const dependencyReqs = requirements.filter((req) => req.type === 'dependency');

  if (dateReq) {
    core.info(`Release Date: ${dateReq.value} (from ${dateReq.source})`);
  }

  if (dependencyReqs.length > 0) {
    core.info(`Dependencies (${dependencyReqs.length}):`);
    dependencyReqs.forEach((req) => {
      core.info(`- ${req.value} (from ${req.source})`);
    });
  }

  if (!dateReq && dependencyReqs.length === 0) {
    core.info('No requirements found');
  }

  core.endGroup();
}
