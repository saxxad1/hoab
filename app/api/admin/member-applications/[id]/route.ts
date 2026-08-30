import { and, count, eq } from "drizzle-orm";
import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../../admin-auth";
import { getDb } from "../../../../../db";
import { auditLogs, houseboats, memberApplications } from "../../../../../db/schema";

export const runtime = "nodejs";

const allowedStatuses = new Set([
  "submitted",
  "under_review",
  "additional_information_required",
  "approved",
  "rejected",
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRequest(request);
  if (!admin) return Response.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const { id } = await params;
    const applicationId = Number(id);
    if (!Number.isInteger(applicationId)) {
      return Response.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const db = getDb();
    const [application] = await db
      .select()
      .from(memberApplications)
      .where(eq(memberApplications.id, applicationId))
      .limit(1);

    if (!application) return Response.json({ error: "Application not found" }, { status: 404 });
    return Response.json({ application });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request) || !canAdminWrite(admin.role, "applications")) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const applicationId = Number(id);
    const body = (await request.json()) as { status?: string; internalNote?: string };

    if (!Number.isInteger(applicationId)) {
      return Response.json({ error: "Invalid application ID" }, { status: 400 });
    }
    if (!body.status || !allowedStatuses.has(body.status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = getDb();
    const [before] = await db
      .select()
      .from(memberApplications)
      .where(eq(memberApplications.id, applicationId))
      .limit(1);

    if (!before) return Response.json({ error: "Application not found" }, { status: 404 });

    const now = new Date().toISOString();
    await db
      .update(memberApplications)
      .set({
        status: body.status,
        internalNote: body.internalNote !== undefined ? body.internalNote.trim() : before.internalNote,
        reviewerEmail: admin.email,
        updatedAt: now,
      })
      .where(eq(memberApplications.id, applicationId));

    let createdHouseboat: typeof houseboats.$inferSelect | null = null;
    if (body.status === "approved") {
      const [existingBoat] = await db
        .select()
        .from(houseboats)
        .where(and(eq(houseboats.nameEn, before.boatName), eq(houseboats.contactNumber, before.ownerPhone)))
        .limit(1);

      if (existingBoat) {
        createdHouseboat = existingBoat;
      } else {
        const [total] = await db.select({ value: count() }).from(houseboats);
        const memNum = `HOAB-HB-${String(total.value + 1).padStart(3, "0")}`;
        let baseSlug = slugify(before.boatName) || `houseboat-${total.value + 1}`;

        const [existingSlug] = await db
          .select({ slug: houseboats.slug })
          .from(houseboats)
          .where(eq(houseboats.slug, baseSlug))
          .limit(1);

        if (existingSlug) {
          baseSlug = `${baseSlug}-${total.value + 1}`;
        }

        [createdHouseboat] = await db
          .insert(houseboats)
          .values({
            membershipNumber: memNum,
            slug: baseSlug,
            nameEn: before.boatName,
            nameBn: before.boatName,
            ownerName: before.ownerName,
            contactNumber: before.ownerPhone,
            email: before.ownerEmail,
            category: before.membershipType === "Steel" ? "Steel" : "Wooden",
            airConditioned: before.membershipType === "AC",
            cabins: before.totalCabins || 0,
            address: before.officeAddress || before.permanentAddress,
            district: "Sunamganj",
            operatingArea: "Tanguar Haor",
            status: "active",
            published: false, // Default to unpublished until complete images/details are configured
            joiningDate: new Date().toISOString().slice(0, 10),
            lastVerifiedAt: new Date().toISOString().slice(0, 10),
          })
          .returning();
      }
    }

    const [after] = await db
      .select()
      .from(memberApplications)
      .where(eq(memberApplications.id, applicationId))
      .limit(1);

    await db.insert(auditLogs).values({
      actorEmail: admin.email,
      action: "review",
      entityType: "member_application",
      entityId: String(applicationId),
      summary: `Member application for ${before.boatName} (${before.ownerName}) marked ${body.status}`,
      beforeJson: JSON.stringify(before),
      afterJson: JSON.stringify(after),
    });

    return Response.json({ application: after, houseboat: createdHouseboat });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Review failed" },
      { status: 500 }
    );
  }
}
