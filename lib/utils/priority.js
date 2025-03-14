"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prioritizeRequirements = prioritizeRequirements;
function prioritizeRequirements(requirements) {
    const dateRequirements = requirements.filter((req) => req.type === 'date');
    const dependencyRequirements = requirements.filter((req) => req.type === 'dependency');
    // For dates, only keep the highest priority one
    const highestPriorityDate = dateRequirements.reduce((highest, current) => (!highest || current.priority > highest.priority ? current : highest), null);
    // For dependencies, keep all unique ones, preferring higher priority when duplicated
    const uniqueDependencies = new Map();
    dependencyRequirements.forEach((req) => {
        const existing = uniqueDependencies.get(req.value);
        if (!existing || req.priority > existing.priority) {
            uniqueDependencies.set(req.value, req);
        }
    });
    return [
        ...(highestPriorityDate ? [highestPriorityDate] : []),
        ...Array.from(uniqueDependencies.values()),
    ];
}
