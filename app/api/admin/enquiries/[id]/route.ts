import { canAdminWrite, requireAdminRequest } from "../../../../admin-auth";
import { getD1 } from "../../../../../db";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRequest(request); if (!admin || !canAdminWrite(admin.role,"enquiries")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await params; const body = await request.json() as { status?: string }; if (!body.status || !["new","in_progress","resolved","archived"].includes(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
  const d1 = getD1(); await d1.prepare("UPDATE enquiries SET status=? WHERE id=?").bind(body.status, Number(id)).run(); await d1.prepare("INSERT INTO audit_logs (actor_email,action,entity_type,entity_id,summary) VALUES (?,'update','enquiry',?,?)").bind(admin.email, id, `Enquiry marked ${body.status}`).run(); return Response.json({ ok: true });
}
