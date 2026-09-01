import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { memberApplications, memberDocuments } from "../../../../db/schema";
import { createSubmissionToken, hashSubmissionToken } from "../../../../lib/application-token";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { PRIVATE_DOCUMENT_BUCKET } from "../../../../lib/supabase/config";

export const runtime = "nodejs";

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const allowedDocumentTypes = new Set([
  "trade_license",
  "owner_photo",
  "owner_nid",
  "dg_shipping",
  "survey_certificate",
  "payment_slip",
]);
const maxFileSize = 12 * 1024 * 1024;

type DocumentInput = { documentType?: string; name?: string; contentType?: string; size?: number };

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 90);
}

function referenceNumber() {
  const year = new Date().getUTCFullYear();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `HOAB-MEM-${year}-${token}`;
}

function text(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? (body[key] as string).trim() : "";
}

function num(body: Record<string, unknown>, key: string, fallback = 0) {
  const val = Number(body[key]);
  return isNaN(val) ? fallback : val;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const required = [
      "ownerName",
      "ownerNid",
      "ownerPhone",
      "ownerEmail",
      "permanentAddress",
      "boatName",
      "tradeLicenseNumber",
      "membershipType",
    ];
    const missing = required.filter((key) => !text(body, key));
    if (missing.length) {
      return Response.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const email = text(body, "ownerEmail").toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "A valid email is required" }, { status: 400 });
    }

    const membershipType = text(body, "membershipType") || "Wooden";
    let feeAmount = 15000;
    if (membershipType === "Steel") feeAmount = 20000;
    if (membershipType === "AC") feeAmount = 25000;

    const documents = Array.isArray(body.documents) ? (body.documents as DocumentInput[]) : [];

    for (const document of documents) {
      if (!document.documentType || !allowedDocumentTypes.has(document.documentType)) {
        return Response.json({ error: `Invalid document type: ${document.documentType}` }, { status: 400 });
      }
      if (!document.name || !document.contentType || typeof document.size !== "number") {
        return Response.json({ error: "Invalid document metadata" }, { status: 400 });
      }
      if (!allowedMimeTypes.has(document.contentType)) {
        return Response.json({ error: `${document.name} is not an allowed JPG/PNG/WebP/PDF file` }, { status: 400 });
      }
      if (document.size <= 0 || document.size > maxFileSize) {
        return Response.json({ error: `${document.name} exceeds the 12 MB limit` }, { status: 400 });
      }
    }

    const reference = referenceNumber();
    const submissionToken = createSubmissionToken();
    const db = getDb();

    const [application] = await db
      .insert(memberApplications)
      .values({
        referenceNumber: reference,
        membershipType,
        feeAmount,
        ownerName: text(body, "ownerName"),
        ownerNid: text(body, "ownerNid"),
        ownerPhone: text(body, "ownerPhone"),
        ownerEmail: email,
        permanentAddress: text(body, "permanentAddress"),
        fatherName: text(body, "fatherName"),
        fatherNid: text(body, "fatherNid"),
        boatName: text(body, "boatName"),
        tradeLicenseNumber: text(body, "tradeLicenseNumber"),
        dgShippingNumber: text(body, "dgShippingNumber"),
        officeAddress: text(body, "officeAddress"),
        length: text(body, "length"),
        width: text(body, "width"),
        height: text(body, "height"),
        totalCabins: num(body, "totalCabins"),
        lifeJacketCount: num(body, "lifeJacketCount"),
        lifeBuoyCount: num(body, "lifeBuoyCount"),
        engineDetails: text(body, "engineDetails"),
        firstAidBox: body.firstAidBox !== false,
        fireSafetyEquipment: text(body, "fireSafetyEquipment"),
        facebookPage: text(body, "facebookPage"),
        businessEmail: text(body, "businessEmail"),
        totalStaff: num(body, "totalStaff"),
        managerName: text(body, "managerName"),
        managerPhone: text(body, "managerPhone"),
        sukaniName: text(body, "sukaniName"),
        sukaniPhone: text(body, "sukaniPhone"),
        driverName: text(body, "driverName"),
        driverPhone: text(body, "driverPhone"),
        paymentMethod: text(body, "paymentMethod") || "Bank Deposit",
        paymentReference: text(body, "paymentReference"),
        paymentDate: text(body, "paymentDate") || new Date().toISOString().slice(0, 10),
        status: "uploading",
        submissionTokenHash: hashSubmissionToken(submissionToken),
      })
      .returning();

    try {
      const storage = getSupabaseAdmin().storage.from(PRIVATE_DOCUMENT_BUCKET);
      const documentRows: Array<typeof memberDocuments.$inferInsert> = [];
      const uploads: Array<{ documentType: string; path: string; token: string }> = [];

      for (const document of documents) {
        const documentType = String(document.documentType);
        const name = String(document.name);
        const path = `members/${application.id}/${crypto.randomUUID()}-${safeSegment(name)}`;
        const { data, error } = await storage.createSignedUploadUrl(path);
        if (error || !data) throw new Error(error?.message || "Unable to prepare secure document upload");
        documentRows.push({
          applicationId: application.id,
          documentType,
          storageKey: path,
          originalName: name,
          contentType: String(document.contentType),
          size: Number(document.size),
        });
        uploads.push({ documentType, path, token: data.token });
      }

      if (documentRows.length) {
        await db.insert(memberDocuments).values(documentRows);
      }
      return Response.json({ referenceNumber: reference, submissionToken, uploads, email }, { status: 201 });
    } catch (uploadPreparationError) {
      await db.delete(memberApplications).where(eq(memberApplications.id, application.id));
      throw uploadPreparationError;
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to start membership application" },
      { status: 500 }
    );
  }
}
