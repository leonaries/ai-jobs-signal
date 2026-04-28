import { NextResponse } from "next/server";
import { getPublishedSignals } from "@/lib/data/signals";
import type { SignalChannel, SourceType } from "@/types/signal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") as SignalChannel | null;
  const source = searchParams.get("source") as SourceType | null;

  const signals = await getPublishedSignals({
    channel: channel ?? undefined,
    sourceType: source ?? undefined
  });

  return NextResponse.json({ signals });
}
