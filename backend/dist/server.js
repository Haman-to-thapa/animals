"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("--> SERVER SCRIPT STARTED <--");
// Import app AFTER logging to catch import errors
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const cronService_1 = require("./services/cronService");
console.log("--> IMPORTS COMPLETED <--");
app_1.default.listen(env_1.ENV.PORT, () => {
    console.log(`Server running on port ${env_1.ENV.PORT}`);
    (0, cronService_1.initCronJobs)();
    // Server ready for AI requests (Port 4001, Model updated to llama-3.1-8b-instant)
});
