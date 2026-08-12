import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { b2bApplications, b2bDocuments } from "../../../../../db/schema";
import { submissionTokenMatches } from "../../../../../lib/application-token";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";
import { PRIVATE_DOCUMENT_BUCKET } from "../../../../../lib/supabase/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { referenceNumber?: string; submissionToken?: string };
    const referenceNumber = body.referenceNumber?.trim() ?? "";
    const token = body.submissionToken ?? "";
    if (!referenceNumber || !token) return Response.json({ error: "Invalid completion request" }, { status: 400 });

    const db = getDb();
    const [application] = await db.select().from(b2bApplications).where(and(eq(b2bApplications.referenceNumber, referenceNumber), eq(b2bApplications.status, "uploading"))).limit(1);
    if (!application || !submissionTokenMatches(token, application.submissionTokenHash)) return Response.json({ error: "Application upload session is invalid or expired" }, { status: 403 });
    const documents = await db.select().from(b2bDocuments).where(eq(b2bDocuments.applicationId, application.id));
    const storage = getSupabaseAdmin().storage.from(PRIVATE_DOCUMENT_BUCKET);
    const { data: storedObjects, error } = await storage.list(String(application.id), { limit: 20 });
    if (error) throw new Error(error.message);
    const storedNames = new Set((storedObjects ?? []).map((item) => `${application.id}/${item.name}`));
    if (!documents.length || documents.some((document) => !storedNames.has(document.storageKey))) return Response.json({ error: "One or more documents did not finish uploading. Please try again." }, { status: 409 });

    const completedAt = new Date().toISOString();
    const [completed] = await db.update(b2bApplications).set({ status: "submitted", submissionTokenHash: "", uploadCompletedAt: completedAt, updatedAt: completedAt }).where(eq(b2bApplications.id, application.id)).returning();
    return Response.json({ referenceNumber: completed.referenceNumber, submittedAt: completed.submittedAt, email: completed.email });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to complete the application" }, { status: 500 });
  }
}
