import { desc } from "drizzle-orm";
import { requireAdminRequest } from "../../../admin-auth";
import { getDb } from "../../../../db";
import { adminUsers, auditLogs, authorisedAgents, b2bApplications, boatCategories, enquiries, events, houseboats, leadership, mediaAssets, pages, posts, resources, settings } from "../../../../db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdminRequest(request);
  if (!admin) return Response.json({ error: "Unauthorised" }, { status: 401 });
  try {
    const db = getDb();
    const [boats, applications, agents, news, leaders, resourceRows, enquiryRows, settingRows, logs, users, media, eventRows, pageRows, categories] = await Promise.all([
      db.select().from(houseboats).orderBy(desc(houseboats.updatedAt)),
      db.select().from(b2bApplications).orderBy(desc(b2bApplications.submittedAt)),
      db.select().from(authorisedAgents).orderBy(desc(authorisedAgents.updatedAt)),
      db.select().from(posts).orderBy(desc(posts.updatedAt)),
      db.select().from(leadership).orderBy(leadership.panel, leadership.displayOrder),
      db.select().from(resources).orderBy(resources.displayOrder),
      db.select().from(enquiries).orderBy(desc(enquiries.createdAt)),
      db.select().from(settings),
      db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(40),
      db.select().from(adminUsers).orderBy(adminUsers.email),
      db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(100),
      db.select().from(events).orderBy(desc(events.eventDate)),
      db.select().from(pages).orderBy(pages.pageKey),
      db.select().from(boatCategories).orderBy(boatCategories.displayOrder),
    ]);
    const pending = applications.filter((item) => ["submitted", "under_review", "additional_information_required"].includes(item.status)).length;
    return Response.json({ admin, boats, applications, agents, posts: news, leadership: leaders, resources: resourceRows, enquiries: enquiryRows, settings: Object.fromEntries(settingRows.map((item) => [item.key, item.value])), logs, users, media, events: eventRows, pages: pageRows, categories, stats: { boats: boats.filter((item) => !item.archivedAt).length, activeBoats: boats.filter((item) => item.status === "active" && !item.archivedAt).length, pendingApplications: pending, agents: agents.filter((item) => item.status === "authorised").length, news: news.length, enquiries: enquiryRows.filter((item) => item.status === "new").length } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to load admin data" }, { status: 500 }); }
}
