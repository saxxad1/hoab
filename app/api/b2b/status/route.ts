import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { b2bApplications } from "../../../../db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference")?.trim() ?? "";
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!reference || !email) return Response.json({ error: "Reference and email are required" }, { status: 400 });
  const [row] = await getDb().select({
    referenceNumber: b2bApplications.referenceNumber,
    agencyName: b2bApplications.agencyName,
    status: b2bApplications.status,
    submittedAt: b2bApplications.submittedAt,
    updatedAt: b2bApplications.updatedAt,
  }).from(b2bApplications).where(and(eq(b2bApplications.referenceNumber, reference), eq(b2bApplications.email, email))).limit(1);
  return row ? Response.json({ application: row }) : Response.json({ error: "Application not found" }, { status: 404 });
}
