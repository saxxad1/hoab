import { requireAdminRequest } from "../../../../../admin-auth";
import { getDb } from "../../../../../../db";
import { eq } from "drizzle-orm";
import { b2bDocuments } from "../../../../../../db/schema";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await params;
  return Response.json({ documents: await getDb().select({ id: b2bDocuments.id, documentType: b2bDocuments.documentType, originalName: b2bDocuments.originalName, contentType: b2bDocuments.contentType, size: b2bDocuments.size, createdAt: b2bDocuments.createdAt }).from(b2bDocuments).where(eq(b2bDocuments.applicationId, Number(id))) });
}
