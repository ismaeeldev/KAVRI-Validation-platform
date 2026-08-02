import { NextRequest, NextResponse } from "next/server";
import { publishDueScheduledUpdates } from "@/server/services/public-update-service";

// Triggered every 15 minutes by Vercel Cron (see vercel.json). Protected by a shared-secret
// header so it cannot be invoked by an outside request - Vercel Cron automatically sends
// `Authorization: Bearer ${CRON_SECRET}` for cron-triggered requests when CRON_SECRET is set.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured on this deployment." }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publishedIds = await publishDueScheduledUpdates();

  return NextResponse.json({ published: publishedIds });
}
