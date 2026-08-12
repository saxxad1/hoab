import { getDb, getUploads } from "../../../../db";
import { b2bApplications, b2bDocuments } from "../../../../db/schema";
import { seedDatabase } from "../../../../db/seed";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxFileSize = 8 * 1024 * 1024;

function textValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 90);
}

function referenceNumber() {
  const year = new Date().getUTCFullYear();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `HOAB-B2B-${year}-${token}`;
}

export async function POST(request: Request) {
  try {
    await seedDatabase();
    const form = await request.formData();
    const required = ["agencyName", "agencyType", "tradeLicenseNumber", "contactName", "designation", "mobile", "email", "address", "district"];
    const missing = required.filter((key) => !textValue(form, key));
    if (missing.length) return Response.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    const email = textValue(form, "email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "A valid email is required" }, { status: 400 });

    const files = ["tradeLicense", "associationCertificate", "nidDocument", "additionalDocument"].map((key) => [key, form.get(key)] as const).filter((item): item is readonly [string, File] => item[1] instanceof File && item[1].size > 0);
    const suppliedTypes = new Set(files.map(([type]) => type));
    if (["tradeLicense", "associationCertificate", "nidDocument"].some((type) => !suppliedTypes.has(type))) return Response.json({ error: "Trade license, association certificate and NID document are required" }, { status: 400 });
    for (const [, file] of files) {
      if (!allowedTypes.has(file.type)) return Response.json({ error: `${file.name} is not an allowed PDF/JPG/PNG file` }, { status: 400 });
      if (file.size > maxFileSize) return Response.json({ error: `${file.name} exceeds the 8 MB limit` }, { status: 400 });
    }

    const reference = referenceNumber();
    const db = getDb();
    const [application] = await db.insert(b2bApplications).values({
      referenceNumber: reference,
      agencyName: textValue(form, "agencyName"),
      agencyType: textValue(form, "agencyType"),
      yearEstablished: textValue(form, "yearEstablished"),
      tradeLicenseNumber: textValue(form, "tradeLicenseNumber"),
      tradeAssociationName: textValue(form, "tradeAssociationName"),
      associationMembershipNumber: textValue(form, "associationMembershipNumber"),
      website: textValue(form, "website"),
      facebookUrl: textValue(form, "facebookUrl"),
      contactName: textValue(form, "contactName"),
      designation: textValue(form, "designation"),
      mobile: textValue(form, "mobile"),
      whatsapp: textValue(form, "whatsapp"),
      email,
      nidNumber: textValue(form, "nidNumber"),
      address: textValue(form, "address"),
      district: textValue(form, "district"),
      division: textValue(form, "division"),
      businessType: textValue(form, "businessType") || textValue(form, "agencyType"),
      status: "submitted",
    }).returning();

    if (files.length) {
      const bucket = getUploads();
      for (const [documentType, file] of files) {
        const key = `b2b/${application.id}/${crypto.randomUUID()}-${safeSegment(file.name)}`;
        await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type }, customMetadata: { applicationReference: reference, documentType } });
        await db.insert(b2bDocuments).values({ applicationId: application.id, documentType, storageKey: key, originalName: file.name, contentType: file.type, size: file.size });
      }
    }

    return Response.json({ referenceNumber: reference, submittedAt: application.submittedAt, email }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to submit the application" }, { status: 500 });
  }
}
