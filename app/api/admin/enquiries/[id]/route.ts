import { eq } from "drizzle-orm";
import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../../admin-auth";
import { getDb } from "../../../../../db";
import { auditLogs, enquiries } from "../../../../../db/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, "enquiries")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await params;
  const enquiryId = Number(id);
  const body = await request.json() as { status?: string };
  if (!Number.isInteger(enquiryId)) return Response.json({ error: "Invalid enquiry ID" }, { status: 400 });
  if (!body.status || !["new", "in_progress", "resolved", "archived"].includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
  const db = getDb();
  await db.update(enquiries).set({ status: body.status }).where(eq(enquiries.id, enquiryId));
  await db.insert(auditLogs).values({ actorEmail: admin.email, action: "update", entityType: "enquiry", entityId: id, summary: `Enquiry marked ${body.status}` });
  return Response.json({ ok: true });
}
