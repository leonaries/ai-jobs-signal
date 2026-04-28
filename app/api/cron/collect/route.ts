import { NextResponse } from "next/server";
import { collectSignals } from "@/lib/pipeline/collect";
import { getSql, hasDatabaseConfig } from "@/lib/db/client";

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const requestSecret = request.headers.get("x-cron-secret") ?? new URL(request.url).searchParams.get("secret");

  if (!expectedSecret || requestSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      { error: "DATABASE_URL is required for collection." },
      { status: 500 }
    );
  }

  const summary = await collectSignals(getSql());

  return NextResponse.json({
    ok: true,
    summary
  });
}
