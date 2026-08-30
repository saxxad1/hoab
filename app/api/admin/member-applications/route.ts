import { desc } from "drizzle-orm";
import { requireAdminRequest } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { memberApplications } from "../../../../db/schema";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(memberApplications)
      .orderBy(desc(memberApplications.submittedAt));

    return Response.json({ applications: rows });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
