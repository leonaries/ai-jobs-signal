import { cache } from "react";
import { mockDailyReport } from "@/lib/mock-data";
import { getSql, hasDatabaseConfig } from "@/lib/db/client";
import type { DailyReport } from "@/types/signal";

export const getLatestDailyReport = cache(async () => {
  if (!hasDatabaseConfig()) {
    return mockDailyReport;
  }

  const sql = getSql();

  try {
    const data = await sql<DailyReport[]>`
      select *
      from daily_reports
      order by report_date desc
      limit 1
    `;
    return data[0] ? normalizeDailyReport(data[0]) : mockDailyReport;
  } catch (error) {
    console.error("Failed to fetch daily report", error);
    return mockDailyReport;
  }
});

function normalizeDailyReport(report: DailyReport) {
  return {
    ...report,
    report_date: normalizeDateOnly(report.report_date),
    created_at: normalizeDateTime(report.created_at)
  } satisfies DailyReport;
}

function normalizeDateOnly(value: string | Date) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function normalizeDateTime(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}
