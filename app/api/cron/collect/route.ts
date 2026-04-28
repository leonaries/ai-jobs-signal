import { NextResponse } from "next/server";
import { collectSignals } from "@/lib/pipeline/collect";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const requestSecret = request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");

  if (!expectedSecret || requestSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase environment variables are required for collection." },
      { status: 500 }
    );
  }

  const supabase = createSupabaseServerClient();
  const summary = await collectSignals(supabase);

  return NextResponse.json({
    ok: true,
    summary
  });
}
