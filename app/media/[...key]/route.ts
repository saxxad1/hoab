import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { PUBLIC_MEDIA_BUCKET } from "../../../lib/supabase/config";

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const storageKey = key.join("/");
  const { data, error } = await getSupabaseAdmin().storage.from(PUBLIC_MEDIA_BUCKET).download(storageKey);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(await data.arrayBuffer(), {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": data.type.startsWith("image/") ? "public, max-age=31536000, immutable" : "public, max-age=3600",
    },
  });
}
