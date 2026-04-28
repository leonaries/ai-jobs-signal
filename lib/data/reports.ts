import { cache } from "react";
import { mockDailyReport } from "@/lib/mock-data";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { DailyReport } from "@/types/signal";

export const getLatestDailyReport = cache(async () => {
  if (!hasSupabaseConfig()) {
    return mockDailyReport;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_reports")
    .select("*")
    .order("report_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch daily report", error);
    return mockDailyReport;
  }

  return (data as DailyReport | null) ?? mockDailyReport;
});
