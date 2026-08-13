import readXlsxFile from "read-excel-file/node";
import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../../admin-auth";
import { getDb } from "../../../../../db";
import { auditLogs, houseboats } from "../../../../../db/schema";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const aliases: Record<string, string> = { "membership no.": "membership_number", "membership no": "membership_number", "membership number": "membership_number", "membership_number": "membership_number", "houseboat name": "name_en", "houseboat_name": "name_en", "owner's name": "owner_name", "owner": "owner_name", "owner_name": "owner_name", "contact number": "contact_number", "contact": "contact_number", "contact_number": "contact_number", "email": "email", "boat type": "category", "boat_type": "category", "district": "district" };
const requiredHeaders = ["membership_number", "name_en", "owner_name", "contact_number"];

function headerAlias(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase().replaceAll("’", "'").replace(/\s+/g, " ");
  return aliases[normalized] ?? "";
}

function headerRowIndex(rows: unknown[][]) {
  return rows.findIndex((row) => {
    const mapped = row.map(headerAlias);
    return requiredHeaders.every((header) => mapped.includes(header));
  });
}

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

function normalizeMembershipNumber(value: string) {
  const trimmed = value.trim();
  const numeric = trimmed.match(/^(?:HOAB[\s-]*)?0*(\d+)$/i);
  return numeric ? `HOAB-${numeric[1].padStart(3, "0")}` : trimmed.toUpperCase();
}

function normalizeContactNumber(value: string) {
  const trimmed = value.trim();
  return /^1\d{9}$/.test(trimmed) ? `0${trimmed}` : trimmed;
}

function slugify(value: string, membershipNumber: string) {
  const name = value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65);
  const membership = membershipNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${name || "houseboat"}-${membership}`.slice(0, 90);
}

export async function POST(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, "houseboats")) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "CSV or XLSX file required" }, { status: 400 });
    if (file.size > 4 * 1024 * 1024) return Response.json({ error: "File exceeds 4 MB" }, { status: 400 });
    const rows: unknown[][] = file.name.toLowerCase().endsWith(".xlsx") ? await readXlsxFile(Buffer.from(await file.arrayBuffer())) : parseCsv(await file.text());
    if (rows.length < 2) return Response.json({ error: "No data rows found" }, { status: 400 });

    const headerIndex = headerRowIndex(rows);
    if (headerIndex < 0) return Response.json({ error: `Header row not found. Required columns: ${requiredHeaders.join(", ")}` }, { status: 400 });
    const headers = rows[headerIndex].map(headerAlias);
    const records: Record<string, string>[] = rows.slice(headerIndex + 1)
      .map((row) => Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()]).filter(([header]) => header)))
      .filter((record) => Object.values(record).some(Boolean));
    // A membership number is the only required value for the association's
    // register. Incomplete contact/profile fields stay blank for later editing.
    const valid = records.filter((record) => record.membership_number);
    const invalid = records.length - valid.length;
    const db = getDb();
    const existingRows = await db.select({ membershipNumber: houseboats.membershipNumber }).from(houseboats);
    const existingMemberships = new Set(existingRows.map((row) => row.membershipNumber));
    const now = new Date().toISOString();
    const importRows = valid.map((record) => {
      const membershipNumber = normalizeMembershipNumber(record.membership_number);
      return {
        membership_number: membershipNumber,
        slug: slugify(record.name_en, membershipNumber),
        name_en: record.name_en || "",
        owner_name: record.owner_name || "",
        contact_number: normalizeContactNumber(record.contact_number),
        email: (record.email || "").toLowerCase(),
        category: record.category || "",
        district: record.district || "",
        status: "active",
        published: true,
        archived_at: null,
        updated_at: now,
      };
    });
    const imported = importRows.filter((record) => !existingMemberships.has(record.membership_number)).length;
    const updated = importRows.length - imported;
    if (importRows.length) {
      const { error } = await getSupabaseAdmin().from("houseboats").upsert(importRows as never[], { onConflict: "membership_number" });
      if (error) throw new Error(error.message);
    }
    await db.insert(auditLogs).values({ actorEmail: admin.email, action: "import", entityType: "houseboats", summary: `Imported ${imported}, updated ${updated}`, afterJson: JSON.stringify({ imported, updated, invalid, file: file.name }) });
    return Response.json({ imported, updated, invalid, total: records.length, headerRow: headerIndex + 1 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: 500 });
  }
}
