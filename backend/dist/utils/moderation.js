"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAILY_REPORT_LIMIT = exports.REPORT_THRESHOLD = void 0;
exports.startOfToday = startOfToday;
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
exports.REPORT_THRESHOLD = 3;
exports.DAILY_REPORT_LIMIT = 10;
