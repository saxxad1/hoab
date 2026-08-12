import { canAdminWrite, requireAdminRequest } from "../../../admin-auth";
import { getD1 } from "../../../../db";
import { seedDatabase } from "../../../../db/seed";

const allowed = new Set(["site_name","official_email","official_phone","office_address","facebook_url","youtube_url","instagram_url","office_hours","hero_title_en","hero_title_bn","hero_subtitle_en","hero_subtitle_bn"]);

export async function PATCH(request: Request) {
  const admin = await requireAdminRequest(request); if (!admin || !canAdminWrite(admin.role,"settings")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    await seedDatabase(); const body = await request.json() as Record<string, unknown>; const entries = Object.entries(body).filter(([key, value]) => allowed.has(key) && typeof value === "string");
    if (!entries.length) return Response.json({ error: "No valid settings" }, { status: 400 }); const d1 = getD1();
    await d1.batch(entries.map(([key, value]) => d1.prepare("INSERT INTO settings (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP").bind(key, String(value))));
    await d1.prepare("INSERT INTO audit_logs (actor_email,action,entity_type,summary,after_json) VALUES (?,'update','settings','Updated website settings',?)").bind(admin.email, JSON.stringify(Object.fromEntries(entries))).run();
    return Response.json({ ok: true, settings: Object.fromEntries(entries) });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Settings update failed" }, { status: 500 }); }
}
