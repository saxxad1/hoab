import { canAdminWrite, requireAdminRequest } from "../../../../admin-auth";
import { getD1 } from "../../../../../db";
import { seedDatabase } from "../../../../../db/seed";

type EntityConfig = { table: string; fields: string[]; required: string[]; softDelete?: boolean; updatedAt?: boolean; };
const entities: Record<string, EntityConfig> = {
  houseboats: { table: "houseboats", required: ["membership_number", "slug", "name_en", "owner_name", "contact_number"], softDelete: true, fields: ["membership_number","slug","name_en","name_bn","owner_name","contact_number","secondary_phone","email","whatsapp","website","facebook_url","category","status","description_en","description_bn","capacity","cabins","air_conditioned","address","district","operating_area","amenities","cover_image","gallery","joining_date","last_verified_at","featured","published","display_order","seo_title","seo_description"] },
  posts: { table: "posts", required: ["slug", "title_en"], fields: ["slug","type","category","title_en","title_bn","excerpt_en","excerpt_bn","content_en","content_bn","featured_image","attachment","published_at","status","pinned"] },
  leadership: { table: "leadership", required: ["panel", "name_en", "designation_en"], fields: ["panel","term","name_en","name_bn","designation_en","designation_bn","organization","bio_en","bio_bn","photo","status","display_order"] },
  agents: { table: "authorised_agents", required: ["agent_id", "agency_name", "contact_name", "phone"], fields: ["agent_id","agency_name","contact_name","phone","email","website","location","logo","status","valid_since","expires_at","display_order"] },
  resources: { table: "resources", required: ["title_en"], fields: ["title_en","title_bn","category","description_en","description_bn","file_url","external_url","published","display_order"] },
  events: { table: "events", required: ["name_en","event_date"], fields: ["name_en","name_bn","event_date","start_time","end_time","venue","description_en","description_bn","poster","registration_url","status","published"] },
  pages: { table: "pages", required: ["page_key","title_en"], fields: ["page_key","title_en","title_bn","content_en","content_bn","published"] },
  categories: { table: "boat_categories", required: ["name_en"], fields: ["name_en","name_bn","active","display_order"] },
  users: { table: "admin_users", required: ["email", "role"], fields: ["email","name","role","active"], updatedAt: false },
};

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
function normalizedValues(body: Record<string, unknown>, config: EntityConfig) {
  return Object.fromEntries(config.fields.filter((field) => field in body).map((field) => [field, typeof body[field] === "boolean" ? (body[field] ? 1 : 0) : body[field] ?? ""]));
}
async function log(d1: D1Database, actor: string, action: string, entity: string, id: string, summary: string, before: unknown, after: unknown) {
  await d1.prepare("INSERT INTO audit_logs (actor_email,action,entity_type,entity_id,summary,before_json,after_json) VALUES (?,?,?,?,?,?,?)").bind(actor, action, entity, id, summary, before ? JSON.stringify(before) : "", after ? JSON.stringify(after) : "").run();
}

export async function POST(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const admin = await requireAdminRequest(request); if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role,(await params).entity)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { entity } = await params; const config = entities[entity]; if (!config) return Response.json({ error: "Unknown entity" }, { status: 404 });
  try {
    await seedDatabase(); const body = await request.json() as Record<string, unknown>; const values = normalizedValues(body, config);
    const missing = config.required.filter((field) => !values[field]); if (missing.length) return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    const fields = Object.keys(values); const placeholders = fields.map(() => "?").join(","); const d1 = getD1();
    const result = await d1.prepare(config.updatedAt === false ? `INSERT INTO ${config.table} (${fields.join(",")}) VALUES (${placeholders}) RETURNING *` : `INSERT INTO ${config.table} (${fields.join(",")},updated_at) VALUES (${placeholders},CURRENT_TIMESTAMP) RETURNING *`).bind(...Object.values(values)).first();
    await log(d1, admin.email, "create", entity, String((result as { id?: number })?.id ?? ""), `Created ${entity} record`, null, result);
    return Response.json({ record: result }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Create failed" }, { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const admin = await requireAdminRequest(request); if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role,(await params).entity)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { entity } = await params; const config = entities[entity]; if (!config) return Response.json({ error: "Unknown entity" }, { status: 404 });
  try {
    await seedDatabase(); const body = await request.json() as Record<string, unknown>; const id = Number(body.id); if (!Number.isInteger(id)) return Response.json({ error: "Valid id required" }, { status: 400 });
    const values = normalizedValues(body, config); const fields = Object.keys(values); if (!fields.length) return Response.json({ error: "No fields to update" }, { status: 400 });
    const d1 = getD1(); const before = await d1.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).bind(id).first();
    const set = fields.map((field) => `${field} = ?`).join(","); const result = await d1.prepare(`UPDATE ${config.table} SET ${set}${config.updatedAt === false ? "" : ", updated_at = CURRENT_TIMESTAMP"} WHERE id = ? RETURNING *`).bind(...Object.values(values), id).first();
    await log(d1, admin.email, "update", entity, String(id), `Updated ${entity} record`, before, result); return Response.json({ record: result });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const admin = await requireAdminRequest(request); if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role,(await params).entity)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { entity } = await params; const config = entities[entity]; if (!config) return Response.json({ error: "Unknown entity" }, { status: 404 });
  try {
    await seedDatabase(); const url = new URL(request.url); const id = Number(url.searchParams.get("id")); if (!Number.isInteger(id)) return Response.json({ error: "Valid id required" }, { status: 400 });
    const d1 = getD1(); const before = await d1.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).bind(id).first();
    if (config.softDelete) await d1.prepare(`UPDATE ${config.table} SET archived_at=CURRENT_TIMESTAMP,published=0,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(id).run(); else await d1.prepare(`DELETE FROM ${config.table} WHERE id=?`).bind(id).run();
    await log(d1, admin.email, config.softDelete ? "archive" : "delete", entity, String(id), `${config.softDelete ? "Archived" : "Deleted"} ${entity} record`, before, null); return Response.json({ ok: true });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 }); }
}
