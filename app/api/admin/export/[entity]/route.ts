import { requireAdminRequest } from "../../../../admin-auth";
import { getD1 } from "../../../../../db";
import { seedDatabase } from "../../../../../db/seed";

const exports: Record<string, { table: string; fields: string[] }> = {
  houseboats: { table: "houseboats", fields: ["membership_number","name_en","name_bn","owner_name","contact_number","email","category","status","district","capacity","cabins","last_verified_at"] },
  agents: { table: "authorised_agents", fields: ["agent_id","agency_name","contact_name","phone","email","website","location","status","valid_since","expires_at"] },
  applications: { table: "b2b_applications", fields: ["reference_number","agency_name","agency_type","contact_name","mobile","email","district","status","submitted_at"] },
};
const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request, { params }: { params: Promise<{ entity: string }> }) {
  if (!await requireAdminRequest(request)) return Response.json({ error: "Unauthorised" }, { status: 401 }); await seedDatabase(); const { entity } = await params; const config = exports[entity]; if (!config) return Response.json({ error: "Unknown export" }, { status: 404 });
  const result = await getD1().prepare(`SELECT ${config.fields.join(",")} FROM ${config.table}`).all<Record<string, unknown>>(); const csv = [config.fields.map(escape).join(","), ...result.results.map((row: Record<string, unknown>) => config.fields.map((field) => escape(row[field])).join(","))].join("\r\n");
  return new Response(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="hoab-${entity}-${new Date().toISOString().slice(0,10)}.csv"` } });
}
