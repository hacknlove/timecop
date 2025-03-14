"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequirements = logRequirements;
exports.logPrioritizedRequirements = logPrioritizedRequirements;
const core = __importStar(require("@actions/core"));
function logRequirements(source, requirements, errors = []) {
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
function logPrioritizedRequirements(requirements) {
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
