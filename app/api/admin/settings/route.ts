import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { auditLogs, settings } from "../../../../db/schema";

const allowed = new Set(["site_name", "official_email", "official_phone", "office_address", "facebook_url", "youtube_url", "instagram_url", "office_hours", "hero_title_en", "hero_subtitle_en", "hero_images"]);

export async function PATCH(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, "settings")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const entries = Object.entries(body).filter(([key, value]) => allowed.has(key) && typeof value === "string");
    if (!entries.length) return Response.json({ error: "No valid settings" }, { status: 400 });
    const db = getDb();
    await db.transaction(async (tx) => {
      for (const [key, value] of entries) {
        await tx.insert(settings).values({ key, value: String(value), updatedAt: new Date().toISOString() }).onConflictDoUpdate({ target: settings.key, set: { value: String(value), updatedAt: new Date().toISOString() } });
      }
      await tx.insert(auditLogs).values({ actorEmail: admin.email, action: "update", entityType: "settings", summary: "Updated website settings", afterJson: JSON.stringify(Object.fromEntries(entries)) });
    });
    return Response.json({ ok: true, settings: Object.fromEntries(entries) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Settings update failed" }, { status: 500 });
  }
}
