import { eq } from "drizzle-orm";
import readXlsxFile from "read-excel-file";
import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../../admin-auth";
import { getDb } from "../../../../../db";
import { auditLogs, houseboats } from "../../../../../db/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const aliases: Record<string, string> = { "membership no.": "membership_number", "membership no": "membership_number", "membership number": "membership_number", "membership_number": "membership_number", "houseboat name": "name_en", "houseboat_name": "name_en", "owner's name": "owner_name", "owner": "owner_name", "owner_name": "owner_name", "contact number": "contact_number", "contact": "contact_number", "contact_number": "contact_number", "email": "email", "boat type": "category", "boat_type": "category", "district": "district" };

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90) || `houseboat-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, "houseboats")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "CSV or XLSX file required" }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return Response.json({ error: "File exceeds 4 MB" }, { status: 400 });
    const rows: unknown[][] = file.name.toLowerCase().endsWith(".xlsx") ? await readXlsxFile(file) : parseCsv(await file.text());
    if (rows.length < 2) return Response.json({ error: "No data rows found" }, { status: 400 });

    const headers = rows[0].map((cell) => aliases[String(cell ?? "").trim().toLowerCase()] ?? "");
    const records: Record<string, string>[] = rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()]).filter(([header]) => header)));
    const valid = records.filter((record) => record.membership_number && record.name_en && record.owner_name && record.contact_number);
    const invalid = records.length - valid.length;
    const db = getDb();
    let imported = 0;
    let updated = 0;

    for (const record of valid) {
      const [existing] = await db.select({ id: houseboats.id }).from(houseboats).where(eq(houseboats.membershipNumber, record.membership_number)).limit(1);
      if (existing) {
        await db.update(houseboats).set({ nameEn: record.name_en, ownerName: record.owner_name, contactNumber: record.contact_number, email: record.email || "", category: record.category || "Wooden", district: record.district || "Sunamganj", updatedAt: new Date().toISOString() }).where(eq(houseboats.id, existing.id));
        updated++;
      } else {
        await db.insert(houseboats).values({ membershipNumber: record.membership_number, slug: slugify(record.name_en), nameEn: record.name_en, ownerName: record.owner_name, contactNumber: record.contact_number, email: record.email || "", category: record.category || "Wooden", district: record.district || "Sunamganj" });
        imported++;
      }
    }
    await db.insert(auditLogs).values({ actorEmail: admin.email, action: "import", entityType: "houseboats", summary: `Imported ${imported}, updated ${updated}`, afterJson: JSON.stringify({ imported, updated, invalid, file: file.name }) });
    return Response.json({ imported, updated, invalid, total: records.length });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 500 });
  }
}
