import { and, count, eq } from "drizzle-orm";
import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../../admin-auth";
import { getDb } from "../../../../../db";
import { auditLogs, authorisedAgents, b2bApplications } from "../../../../../db/schema";

const allowedStatuses = new Set(["submitted", "under_review", "additional_information_required", "approved", "rejected", "suspended"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, "applications")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const { id } = await params;
    const applicationId = Number(id);
    const body = await request.json() as { status?: string; internalNote?: string };
    if (!Number.isInteger(applicationId)) return Response.json({ error: "Invalid application ID" }, { status: 400 });
    if (!body.status || !allowedStatuses.has(body.status)) return Response.json({ error: "Invalid status" }, { status: 400 });

    const db = getDb();
    const [before] = await db.select().from(b2bApplications).where(eq(b2bApplications.id, applicationId)).limit(1);
    if (!before) return Response.json({ error: "Application not found" }, { status: 404 });
    await db.update(b2bApplications).set({ status: body.status, internalNote: body.internalNote?.trim() ?? "", reviewerEmail: admin.email, updatedAt: new Date().toISOString() }).where(eq(b2bApplications.id, applicationId));

    let agent: typeof authorisedAgents.$inferSelect | null = null;
    if (body.status === "approved") {
      const [existing] = await db.select().from(authorisedAgents).where(and(eq(authorisedAgents.email, before.email), eq(authorisedAgents.agencyName, before.agencyName))).limit(1);
      if (existing) agent = existing;
      else {
        const [total] = await db.select({ value: count() }).from(authorisedAgents);
        const agentId = `HOAB-A-${String(total.value + 1).padStart(4, "0")}`;
        [agent] = await db.insert(authorisedAgents).values({
          agentId,
          agencyName: before.agencyName,
          contactName: before.contactName,
          phone: before.mobile,
          email: before.email,
          website: before.website,
          location: before.district,
          status: "authorised",
          validSince: new Date().toISOString().slice(0, 10),
        }).returning();
      }
    }

    const [after] = await db.select().from(b2bApplications).where(eq(b2bApplications.id, applicationId)).limit(1);
    await db.insert(auditLogs).values({ actorEmail: admin.email, action: "review", entityType: "b2b_application", entityId: String(applicationId), summary: `Application marked ${body.status}`, beforeJson: JSON.stringify(before), afterJson: JSON.stringify(after) });
    return Response.json({ application: after, agent });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Review failed" }, { status: 500 });
  }
}
