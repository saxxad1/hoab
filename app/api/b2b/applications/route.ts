import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { b2bApplications, b2bDocuments } from "../../../../db/schema";
import { createSubmissionToken, hashSubmissionToken } from "../../../../lib/application-token";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { PRIVATE_DOCUMENT_BUCKET } from "../../../../lib/supabase/config";

export const runtime = "nodejs";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const allowedDocumentTypes = new Set(["tradeLicense", "associationCertificate", "nidDocument", "additionalDocument"]);
const maxFileSize = 8 * 1024 * 1024;

type DocumentInput = { documentType?: string; name?: string; contentType?: string; size?: number };

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 90);
}

function referenceNumber() {
  const year = new Date().getUTCFullYear();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `HOAB-B2B-${year}-${token}`;
}

function text(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? body[key].trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const required = ["agencyName", "agencyType", "tradeLicenseNumber", "contactName", "designation", "mobile", "email", "address", "district"];
    const missing = required.filter((key) => !text(body, key));
    if (missing.length) return Response.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    const email = text(body, "email").toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "A valid email is required" }, { status: 400 });

    const documents = Array.isArray(body.documents) ? body.documents as DocumentInput[] : [];
    if (documents.length > 4) return Response.json({ error: "Too many documents" }, { status: 400 });
    for (const document of documents) {
      if (!document.documentType || !allowedDocumentTypes.has(document.documentType)) return Response.json({ error: "Invalid document type" }, { status: 400 });
      if (!document.name || !document.contentType || typeof document.size !== "number") return Response.json({ error: "Invalid document metadata" }, { status: 400 });
      if (!allowedTypes.has(document.contentType)) return Response.json({ error: `${document.name} is not an allowed PDF/JPG/PNG file` }, { status: 400 });
      if (document.size <= 0 || document.size > maxFileSize) return Response.json({ error: `${document.name} exceeds the 8 MB limit` }, { status: 400 });
    }

    const reference = referenceNumber();
    const submissionToken = createSubmissionToken();
    const db = getDb();
    const [application] = await db.insert(b2bApplications).values({
      referenceNumber: reference,
      agencyName: text(body, "agencyName"),
      agencyType: text(body, "agencyType"),
      yearEstablished: text(body, "yearEstablished"),
      tradeLicenseNumber: text(body, "tradeLicenseNumber"),
      tradeAssociationName: text(body, "tradeAssociationName"),
      associationMembershipNumber: text(body, "associationMembershipNumber"),
      website: text(body, "website"),
      facebookUrl: text(body, "facebookUrl"),
      contactName: text(body, "contactName"),
      designation: text(body, "designation"),
      mobile: text(body, "mobile"),
      whatsapp: text(body, "whatsapp"),
      email,
      nidNumber: text(body, "nidNumber"),
      address: text(body, "address"),
      district: text(body, "district"),
      division: text(body, "division"),
      businessType: text(body, "businessType") || text(body, "agencyType"),
      status: "uploading",
      submissionTokenHash: hashSubmissionToken(submissionToken),
    }).returning();

    try {
      const storage = getSupabaseAdmin().storage.from(PRIVATE_DOCUMENT_BUCKET);
      const documentRows: Array<typeof b2bDocuments.$inferInsert> = [];
      const uploads: Array<{ documentType: string; path: string; token: string }> = [];
      for (const document of documents) {
        const documentType = String(document.documentType);
        const name = String(document.name);
        const path = `${application.id}/${crypto.randomUUID()}-${safeSegment(name)}`;
        const { data, error } = await storage.createSignedUploadUrl(path);
        if (error || !data) throw new Error(error?.message || "Unable to prepare secure document upload");
        documentRows.push({ applicationId: application.id, documentType, storageKey: path, originalName: name, contentType: String(document.contentType), size: Number(document.size) });
        uploads.push({ documentType, path, token: data.token });
      }
      if (documentRows.length) {
        await db.insert(b2bDocuments).values(documentRows);
      }
      return Response.json({ referenceNumber: reference, submissionToken, uploads, email }, { status: 201 });
    } catch (uploadPreparationError) {
      await db.delete(b2bApplications).where(eq(b2bApplications.id, application.id));
      throw uploadPreparationError;
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to start the application" }, { status: 500 });
  }
}
