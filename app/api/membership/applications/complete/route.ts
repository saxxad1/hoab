import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { memberApplications, memberDocuments } from "../../../../../db/schema";
import { submissionTokenMatches } from "../../../../../lib/application-token";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";
import { PRIVATE_DOCUMENT_BUCKET } from "../../../../../lib/supabase/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { referenceNumber?: string; submissionToken?: string };
    const referenceNumber = body.referenceNumber?.trim() ?? "";
    const token = body.submissionToken ?? "";
    if (!referenceNumber || !token) {
      return Response.json({ error: "Invalid completion request" }, { status: 400 });
    }

    const db = getDb();
    const [application] = await db
      .select()
      .from(memberApplications)
      .where(and(eq(memberApplications.referenceNumber, referenceNumber), eq(memberApplications.status, "uploading")))
      .limit(1);

    if (!application || !submissionTokenMatches(token, application.submissionTokenHash)) {
      return Response.json({ error: "Application upload session is invalid or expired" }, { status: 403 });
    }

    const documents = await db
      .select()
      .from(memberDocuments)
      .where(eq(memberDocuments.applicationId, application.id));

    const storage = getSupabaseAdmin().storage.from(PRIVATE_DOCUMENT_BUCKET);
    const { data: storedObjects, error } = await storage.list(`members/${application.id}`, { limit: 20 });
    if (error) throw new Error(error.message);

    const storedKeys = new Set((storedObjects ?? []).map((item) => `members/${application.id}/${item.name}`));
    if (!documents.length || documents.some((document) => !storedKeys.has(document.storageKey))) {
      return Response.json(
        { error: "One or more documents did not finish uploading. Please try again." },
        { status: 409 }
      );
    }

    const completedAt = new Date().toISOString();
    const [completed] = await db
      .update(memberApplications)
      .set({
        status: "submitted",
        submissionTokenHash: "",
        updatedAt: completedAt,
      })
      .where(eq(memberApplications.id, application.id))
      .returning();

    return Response.json({
      referenceNumber: completed.referenceNumber,
      submittedAt: completed.submittedAt,
      email: completed.ownerEmail,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to complete the membership application" },
      { status: 500 }
    );
  }
}
