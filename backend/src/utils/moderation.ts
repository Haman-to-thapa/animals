export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const REPORT_THRESHOLD = 3;
export const DAILY_REPORT_LIMIT = 10;
