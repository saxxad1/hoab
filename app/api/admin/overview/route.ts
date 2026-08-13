import { desc, isNull } from "drizzle-orm";
import { requireAdminRequest } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { adminUsers, auditLogs, authorisedAgents, b2bApplications, boatCategories, enquiries, events, houseboats, leadership, mediaAssets, pages, posts, resources, settings } from "../../../../db/schema";

export const dynamic = "force-dynamic";

function withoutLegacyTranslations(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).filter(([key]) => !key.endsWith("Bn")));
}

export async function GET(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const db = getDb();
    // Supabase transaction pooling and postgres.js unnamed statements are
    // reliable when these queries are executed sequentially, not pipelined.
    const boats = await db.select().from(houseboats).where(isNull(houseboats.archivedAt)).orderBy(desc(houseboats.updatedAt));
    const applications = await db.select().from(b2bApplications).orderBy(desc(b2bApplications.submittedAt));
    const agents = await db.select().from(authorisedAgents).orderBy(desc(authorisedAgents.updatedAt));
    const news = await db.select().from(posts).orderBy(desc(posts.updatedAt));
    const leaders = await db.select().from(leadership).orderBy(leadership.panel, leadership.displayOrder);
    const resourceRows = await db.select().from(resources).orderBy(resources.displayOrder);
    const enquiryRows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
    const settingRows = await db.select().from(settings);
    const logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(40);
    const users = await db.select().from(adminUsers).orderBy(adminUsers.email);
    const media = await db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(100);
    const eventRows = await db.select().from(events).orderBy(desc(events.eventDate));
    const pageRows = await db.select().from(pages).orderBy(pages.pageKey);
    const categories = await db.select().from(boatCategories).orderBy(boatCategories.displayOrder);
    const pending = applications.filter((item) => ["submitted", "under_review", "additional_information_required"].includes(item.status)).length;
    return Response.json({ admin, boats: boats.map(withoutLegacyTranslations), applications, agents, posts: news.map(withoutLegacyTranslations), leadership: leaders.map(withoutLegacyTranslations), resources: resourceRows.map(withoutLegacyTranslations), enquiries: enquiryRows, settings: Object.fromEntries(settingRows.filter((item) => !item.key.endsWith("_bn")).map((item) => [item.key, item.value])), logs, users, media, events: eventRows.map(withoutLegacyTranslations), pages: pageRows.map(withoutLegacyTranslations), categories: categories.map(withoutLegacyTranslations), stats: { boats: boats.filter((item) => !item.archivedAt).length, activeBoats: boats.filter((item) => item.status === "active" && !item.archivedAt).length, pendingApplications: pending, agents: agents.filter((item) => item.status === "authorised").length, news: news.length, enquiries: enquiryRows.filter((item) => item.status === "new").length } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to load admin data" }, { status: 500 }); }
}
