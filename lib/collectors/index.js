"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectFromCommits = exports.collectFromDescription = exports.collectFromLabels = void 0;
var label_1 = require("./label");
Object.defineProperty(exports, "collectFromLabels", { enumerable: true, get: function () { return label_1.collectFromLabels; } });
var description_1 = require("./description");
Object.defineProperty(exports, "collectFromDescription", { enumerable: true, get: function () { return description_1.collectFromDescription; } });
var commit_1 = require("./commit");
Object.defineProperty(exports, "collectFromCommits", { enumerable: true, get: function () { return commit_1.collectFromCommits; } });
