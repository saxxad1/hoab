import { eq } from "drizzle-orm";
import { requireAdminRequest } from "../../../../../admin-auth";
import { getDb } from "../../../../../../db";
import { memberDocuments } from "../../../../../../db/schema";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminRequest(request))) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  const rows = await db
    .select({
      id: memberDocuments.id,
      documentType: memberDocuments.documentType,
      originalName: memberDocuments.originalName,
      contentType: memberDocuments.contentType,
      size: memberDocuments.size,
      createdAt: memberDocuments.createdAt,
    })
    .from(memberDocuments)
    .where(eq(memberDocuments.applicationId, Number(id)));

  return Response.json({ documents: rows });
}
