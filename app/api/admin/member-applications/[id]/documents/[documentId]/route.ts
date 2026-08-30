import { and, eq } from "drizzle-orm";
import { requireAdminRequest } from "../../../../../../admin-auth";
import { getDb } from "../../../../../../../db";
import { memberDocuments } from "../../../../../../../db/schema";
import { getSupabaseAdmin } from "../../../../../../../lib/supabase/admin";
import { PRIVATE_DOCUMENT_BUCKET } from "../../../../../../../lib/supabase/config";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  if (!(await requireAdminRequest(request))) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id, documentId } = await params;
  const db = getDb();
  const [document] = await db
    .select()
    .from(memberDocuments)
    .where(
      and(
        eq(memberDocuments.applicationId, Number(id)),
        eq(memberDocuments.id, Number(documentId))
      )
    )
    .limit(1);

  if (!document) return Response.json({ error: "Document not found" }, { status: 404 });

  const { data, error } = await getSupabaseAdmin()
    .storage.from(PRIVATE_DOCUMENT_BUCKET)
    .download(document.storageKey);

  if (error || !data) {
    return Response.json({ error: "Stored document not found" }, { status: 404 });
  }

  return new Response(await data.arrayBuffer(), {
    headers: {
      "Content-Type": document.contentType,
      "Content-Disposition": `inline; filename="${document.originalName.replace(/[\"\r\n]/g, "-")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
