import { requireAdminRequest } from "../../../../admin-auth";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";

const exports: Record<string, { table: string; fields: string[] }> = {
  houseboats: { table: "houseboats", fields: ["membership_number","name_en","owner_name","contact_number","email","category","status","district","capacity","cabins","last_verified_at"] },
  agents: { table: "authorised_agents", fields: ["agent_id","agency_name","contact_name","phone","email","website","location","status","valid_since","expires_at"] },
  applications: { table: "b2b_applications", fields: ["reference_number","agency_name","agency_type","contact_name","mobile","email","district","status","submitted_at"] },
};

const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const { entity } = await params;
  const config = exports[entity];
  if (!config) return Response.json({ error: "Unknown export" }, { status: 404 });
  const baseQuery = getSupabaseAdmin().from(config.table).select(config.fields.join(","));
  const { data, error } = entity === "houseboats" ? await baseQuery.is("archived_at", null) : await baseQuery;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as Record<string, unknown>[];
  const csv = [config.fields.map(escape).join(","), ...rows.map((row) => config.fields.map((field) => escape(row[field])).join(","))].join("\r\n");
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="hoab-${entity}-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
