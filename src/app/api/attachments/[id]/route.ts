import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/permissions";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { authorizePhotoAttachment } from "@/server/services/attachment-service";

// Photo attachments are uploaded to Vercel Blob with access:"private" (see
// attachment-actions.ts), so they are not reachable via a guessable public URL. This route is
// the only way to read the underlying bytes back - it re-runs the exact same
// authorizePhotoAttachment ownership check used at upload time before ever calling Blob's get().
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await requireSession();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, session.user.id),
  });
  if (!profile || profile.accountStatus !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const attachment = await db.query.photoAttachments.findFirst({
    where: eq(schema.photoAttachments.id, id),
  });
  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await authorizePhotoAttachment(
      attachment.entityType,
      attachment.entityId,
      session.user.id,
      profile.role as "owner" | "tester"
    );
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Photo storage is not configured on this deployment." }, { status: 500 });
  }

  const { get } = await import("@vercel/blob");
  const result = await get(attachment.storageUrl, { access: "private" });
  if (!result || !result.stream) {
    return NextResponse.json({ error: "Attachment content not found." }, { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
