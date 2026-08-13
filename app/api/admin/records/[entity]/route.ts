import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../../admin-auth";
import { getDb } from "../../../../../db";
import { auditLogs } from "../../../../../db/schema";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";

type EntityConfig = {
  table: string;
  fields: string[];
  required: string[];
  booleanFields?: string[];
  integerFields?: string[];
  timestampFields?: string[];
  softDelete?: boolean;
  updatedAt?: boolean;
};

const entities: Record<string, EntityConfig> = {
  houseboats: { table: "houseboats", required: ["membership_number", "slug", "name_en", "owner_name", "contact_number"], booleanFields: ["air_conditioned", "featured", "published"], integerFields: ["capacity", "cabins", "display_order"], fields: ["membership_number","slug","name_en","owner_name","contact_number","secondary_phone","email","whatsapp","website","facebook_url","category","status","description_en","capacity","cabins","air_conditioned","address","district","operating_area","amenities","cover_image","gallery","joining_date","last_verified_at","featured","published","display_order","seo_title","seo_description"] },
  posts: { table: "posts", required: ["slug", "title_en"], booleanFields: ["pinned"], timestampFields: ["published_at"], fields: ["slug","type","category","title_en","excerpt_en","content_en","featured_image","attachment","published_at","status","pinned"] },
  leadership: { table: "leadership", required: ["panel", "name_en", "designation_en"], integerFields: ["display_order"], fields: ["panel","term","name_en","designation_en","organization","bio_en","photo","status","display_order"] },
  agents: { table: "authorised_agents", required: ["agent_id", "agency_name", "contact_name", "phone"], integerFields: ["display_order"], fields: ["agent_id","agency_name","contact_name","phone","email","website","location","logo","status","valid_since","expires_at","display_order"] },
  resources: { table: "resources", required: ["title_en"], booleanFields: ["published"], integerFields: ["display_order"], fields: ["title_en","category","description_en","file_url","external_url","published","display_order"] },
  events: { table: "events", required: ["name_en","event_date"], booleanFields: ["published"], fields: ["name_en","event_date","start_time","end_time","venue","description_en","poster","registration_url","status","published"] },
  pages: { table: "pages", required: ["page_key","title_en"], booleanFields: ["published"], fields: ["page_key","title_en","content_en","published"] },
  categories: { table: "boat_categories", required: ["name_en"], booleanFields: ["active"], integerFields: ["display_order"], fields: ["name_en","active","display_order"] },
  users: { table: "admin_users", required: ["email", "role"], booleanFields: ["active"], fields: ["email","name","role","active"], updatedAt: false },
};

function asBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true" || value === "on";
}

function normalizedValues(body: Record<string, unknown>, config: EntityConfig) {
  const result: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (!(field in body)) continue;
    const value = body[field];
    if (config.timestampFields?.includes(field) && !value) continue;
    if (config.booleanFields?.includes(field)) result[field] = asBoolean(value);
    else if (config.integerFields?.includes(field)) result[field] = Number(value || 0);
    else result[field] = typeof value === "string" ? value.trim() : value ?? "";
  }
  if (typeof result.email === "string") result.email = result.email.toLowerCase();
  return result;
}

async function log(actor: string, action: string, entity: string, id: string, summary: string, before: unknown, after: unknown) {
  await getDb().insert(auditLogs).values({ actorEmail: actor, action, entityType: entity, entityId: id, summary, beforeJson: before ? JSON.stringify(before) : "", afterJson: after ? JSON.stringify(after) : "" });
}

export async function POST(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, entity)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const config = entities[entity];
  if (!config) return Response.json({ error: "Unknown entity" }, { status: 404 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const values = normalizedValues(body, config);
    const missing = config.required.filter((field) => !values[field]);
    if (missing.length) return Response.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    const { data, error } = await getSupabaseAdmin().from(config.table).insert(values as never).select().single();
    if (error) throw new Error(error.message);
    const record = data as unknown as Record<string, unknown>;
    await log(admin.email, "create", entity, String(record.id ?? ""), `Created ${entity} record`, null, record);
    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Create failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, entity)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const config = entities[entity];
  if (!config) return Response.json({ error: "Unknown entity" }, { status: 404 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id);
    if (!Number.isInteger(id)) return Response.json({ error: "Valid id required" }, { status: 400 });
    const values = normalizedValues(body, config);
    if (!Object.keys(values).length) return Response.json({ error: "No fields to update" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: before } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
    const update = config.updatedAt === false ? values : { ...values, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from(config.table).update(update as never).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    await log(admin.email, "update", entity, String(id), `Updated ${entity} record`, before, data);
    return Response.json({ record: data });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, entity)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const config = entities[entity];
  if (!config) return Response.json({ error: "Unknown entity" }, { status: 404 });
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return Response.json({ error: "Valid id required" }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const { data: before } = await supabase.from(config.table).select("*").eq("id", id).maybeSingle();
    const operation = config.softDelete
      ? supabase.from(config.table).update({ archived_at: new Date().toISOString(), published: false, updated_at: new Date().toISOString() } as never).eq("id", id)
      : supabase.from(config.table).delete().eq("id", id);
    const { error } = await operation;
    if (error) throw new Error(error.message);
    await log(admin.email, config.softDelete ? "archive" : "delete", entity, String(id), `${config.softDelete ? "Archived" : "Deleted"} ${entity} record`, before, null);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 });
  }
}
