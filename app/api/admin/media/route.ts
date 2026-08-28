import { desc } from "drizzle-orm";
import { canAdminWrite, requireAdminRequest, sameOrigin } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { auditLogs, mediaAssets } from "../../../../db/schema";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { PUBLIC_MEDIA_BUCKET } from "../../../../lib/supabase/config";

export const runtime = "nodejs";

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function GET(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin) return Response.json({ error: "Unauthorised" }, { status: 401 });
  return Response.json({ media: await getDb().select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(100) });
}

export async function POST(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin || !sameOrigin(request)) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const body = await request.json() as { action?: string; area?: string; key?: string; name?: string; contentType?: string; size?: number };
    const area = body.area ?? "resources";
    if (!["houseboats", "leadership", "resources", "settings", "posts"].includes(area) || !canAdminWrite(admin.role, area)) return Response.json({ error: "Unauthorised" }, { status: 401 });
    const name = body.name?.trim() ?? "";
    const contentType = body.contentType ?? "";
    const size = Number(body.size ?? 0);
    if (!name || !allowed.has(contentType)) return Response.json({ error: "Only JPG, PNG, WebP and PDF files are allowed" }, { status: 400 });
    if ((area === "houseboats" || area === "leadership" || area === "settings") && contentType === "application/pdf") return Response.json({ error: "Only JPG, PNG and WebP images are allowed" }, { status: 400 });
    if (size <= 0 || size > 12 * 1024 * 1024) return Response.json({ error: "File exceeds 12 MB" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const storage = supabase.storage.from(PUBLIC_MEDIA_BUCKET);
    if (body.action === "prepare") {
      const safe = name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 90);
      const key = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safe}`;
      const { data, error } = await storage.createSignedUploadUrl(key);
      if (error || !data) throw new Error(error?.message || "Unable to prepare upload");
      return Response.json({ key, token: data.token });
    }

    if (body.action !== "complete" || !body.key || !/^\d{4}-\d{2}-\d{2}\/[a-zA-Z0-9._-]+$/.test(body.key)) return Response.json({ error: "Invalid upload completion request" }, { status: 400 });
    const [folder, objectName] = body.key.split("/");
    const { data: objects, error: listError } = await storage.list(folder, { search: objectName, limit: 10 });
    if (listError) throw new Error(listError.message);
    if (!(objects ?? []).some((object) => object.name === objectName)) return Response.json({ error: "Uploaded file was not found" }, { status: 409 });

    const { data: publicData } = storage.getPublicUrl(body.key);
    const db = getDb();
    const [asset] = await db.insert(mediaAssets).values({ storageKey: body.key, publicUrl: publicData.publicUrl, originalName: name, contentType, size, uploadedBy: admin.email }).returning();
    await db.insert(auditLogs).values({ actorEmail: admin.email, action: "upload", entityType: area, entityId: String(asset.id), summary: `Uploaded ${name}`, afterJson: JSON.stringify(asset) });
    return Response.json({ asset }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
