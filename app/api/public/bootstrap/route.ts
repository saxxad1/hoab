import { getPublicData } from "../../../../db/public-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getPublicData(), { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load public data" }, { status: 500 });
  }
}
