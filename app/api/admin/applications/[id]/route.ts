import { canAdminWrite, requireAdminRequest } from "../../../../admin-auth";
import { getD1 } from "../../../../../db";
import { seedDatabase } from "../../../../../db/seed";

const allowedStatuses = new Set(["submitted", "under_review", "additional_information_required", "approved", "rejected", "suspended"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRequest(request); if (!admin || !canAdminWrite(admin.role,"applications")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    await seedDatabase(); const { id } = await params; const applicationId = Number(id); const body = await request.json() as { status?: string; internalNote?: string };
    if (!body.status || !allowedStatuses.has(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });
    const d1 = getD1(); const before = await d1.prepare("SELECT * FROM b2b_applications WHERE id=?").bind(applicationId).first<Record<string, unknown>>();
    if (!before) return Response.json({ error: "Application not found" }, { status: 404 });
    await d1.prepare("UPDATE b2b_applications SET status=?,internal_note=?,reviewer_email=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(body.status, body.internalNote?.trim() ?? "", admin.email, applicationId).run();
    let agent: Record<string, unknown> | null = null;
    if (body.status === "approved") {
      const existing = await d1.prepare("SELECT * FROM authorised_agents WHERE email=? AND agency_name=?").bind(before.email, before.agency_name).first<Record<string, unknown>>();
      if (existing) agent = existing;
      else {
        const count = await d1.prepare("SELECT COUNT(*) AS count FROM authorised_agents").first<{ count: number }>();
        const agentId = `HOAB-A-${String((count?.count ?? 0) + 1).padStart(4, "0")}`;
        agent = await d1.prepare("INSERT INTO authorised_agents (agent_id,agency_name,contact_name,phone,email,website,location,status,valid_since) VALUES (?,?,?,?,?,?,?,'authorised',date('now')) RETURNING *").bind(agentId, before.agency_name, before.contact_name, before.mobile, before.email, before.website, before.district).first<Record<string, unknown>>();
      }
    }
    const after = await d1.prepare("SELECT * FROM b2b_applications WHERE id=?").bind(applicationId).first();
    await d1.prepare("INSERT INTO audit_logs (actor_email,action,entity_type,entity_id,summary,before_json,after_json) VALUES (?,'review','b2b_application',?,?,?,?)").bind(admin.email, String(applicationId), `Application marked ${body.status}`, JSON.stringify(before), JSON.stringify(after)).run();
    return Response.json({ application: after, agent });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Review failed" }, { status: 500 }); }
}
