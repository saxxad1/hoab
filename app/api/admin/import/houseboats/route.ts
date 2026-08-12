import readXlsxFile from "read-excel-file";
import { requireAdminRequest } from "../../../../admin-auth";
import { getD1 } from "../../../../../db";
import { seedDatabase } from "../../../../../db/seed";

const aliases: Record<string, string> = { "membership no.": "membership_number", "membership no": "membership_number", "membership number": "membership_number", "membership_number": "membership_number", "houseboat name": "name_en", "houseboat_name": "name_en", "owner's name": "owner_name", "owner": "owner_name", "owner_name": "owner_name", "contact number": "contact_number", "contact": "contact_number", "contact_number": "contact_number", "email": "email", "boat type": "category", "boat_type": "category", "district": "district" };
function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i=0;i<text.length;i++) { const char=text[i]; if (char==='"') { if (quoted && text[i+1]==='"') { cell+='"'; i++; } else quoted=!quoted; } else if (char===',' && !quoted) { row.push(cell); cell=""; } else if ((char==='\n' || char==='\r') && !quoted) { if (char==='\r' && text[i+1]==='\n') i++; row.push(cell); if (row.some(Boolean)) rows.push(row); row=[]; cell=""; } else cell+=char; }
  row.push(cell); if (row.some(Boolean)) rows.push(row); return rows;
}
function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,90) || `houseboat-${crypto.randomUUID().slice(0,8)}`; }

export async function POST(request: Request) {
  const admin = await requireAdminRequest(request); if (!admin) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    await seedDatabase(); const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File)) return Response.json({ error: "CSV or XLSX file required" }, { status: 400 }); if (file.size > 5*1024*1024) return Response.json({ error: "File exceeds 5 MB" }, { status: 400 });
    let rows: unknown[][]; if (file.name.toLowerCase().endsWith(".xlsx")) rows = await readXlsxFile(file); else rows = parseCsv(await file.text()); if (rows.length < 2) return Response.json({ error: "No data rows found" }, { status: 400 });
    const headers = rows[0].map((cell) => aliases[String(cell ?? "").trim().toLowerCase()] ?? ""); const records = rows.slice(1).map((row) => Object.fromEntries(headers.map((header,index) => [header, String(row[index] ?? "").trim()]).filter(([header]) => header)));
    const valid = records.filter((record) => record.membership_number && record.name_en && record.owner_name && record.contact_number); const invalid = records.length-valid.length; const d1=getD1(); let imported=0; let updated=0;
    for (const record of valid) { const existing=await d1.prepare("SELECT id FROM houseboats WHERE membership_number=?").bind(record.membership_number).first(); if (existing) { await d1.prepare("UPDATE houseboats SET name_en=?,owner_name=?,contact_number=?,email=?,category=?,district=?,updated_at=CURRENT_TIMESTAMP WHERE membership_number=?").bind(record.name_en,record.owner_name,record.contact_number,record.email||"",record.category||"Wooden",record.district||"Sunamganj",record.membership_number).run(); updated++; } else { await d1.prepare("INSERT INTO houseboats (membership_number,slug,name_en,owner_name,contact_number,email,category,district,status,published) VALUES (?,?,?,?,?,?,?,?,'active',1)").bind(record.membership_number,slugify(record.name_en),record.name_en,record.owner_name,record.contact_number,record.email||"",record.category||"Wooden",record.district||"Sunamganj").run(); imported++; } }
    await d1.prepare("INSERT INTO audit_logs (actor_email,action,entity_type,summary,after_json) VALUES (?,'import','houseboats',?,?)").bind(admin.email, `Imported ${imported}, updated ${updated}`, JSON.stringify({ imported,updated,invalid,file:file.name })).run(); return Response.json({ imported, updated, invalid, total: records.length });
  } catch(error) { return Response.json({ error:error instanceof Error?error.message:"Import failed" },{status:500}); }
}
