import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDb } from ".";
import { authorisedAgents, events, houseboats, leadership, pages, posts, resources, settings } from "./schema";
import { seedDatabase } from "./seed";
import type { Boat, Leader, NewsItem, PublicData } from "../app/data";

function jsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

export function mapBoat(row: typeof houseboats.$inferSelect): Boat {
  return {
    id: row.id,
    slug: row.slug,
    name: row.nameEn,
    nameBn: row.nameBn,
    membership: row.membershipNumber,
    type: row.category,
    status: row.status,
    district: row.district,
    operatingArea: row.operatingArea,
    capacity: row.capacity,
    cabins: row.cabins,
    airConditioned: row.airConditioned,
    image: row.coverImage,
    gallery: jsonArray(row.gallery),
    owner: row.ownerName,
    phone: row.contactNumber,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    facebookUrl: row.facebookUrl,
    description: row.descriptionEn,
    descriptionBn: row.descriptionBn,
    verified: row.lastVerifiedAt,
    featured: row.featured,
    amenities: jsonArray(row.amenities),
  };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function mapLeader(row: typeof leadership.$inferSelect): Leader {
  return { id: row.id, panel: row.panel as "executive" | "advisory", term: row.term, name: row.nameEn, nameBn: row.nameBn, role: row.designationEn, roleBn: row.designationBn, organization: row.organization, bio: row.bioEn, bioBn: row.bioBn, photo: row.photo, initials: initials(row.nameEn) };
}

function mapNews(row: typeof posts.$inferSelect): NewsItem {
  return { id: row.id, slug: row.slug, category: row.category, date: row.publishedAt, title: row.titleEn, titleBn: row.titleBn, excerpt: row.excerptEn, excerptBn: row.excerptBn, content: row.contentEn, contentBn: row.contentBn, featuredImage: row.featuredImage, attachment: row.attachment, pinned: row.pinned };
}

export async function getPublicData(): Promise<PublicData> {
  await seedDatabase();
  const db = getDb();
  const [boatRows, leaderRows, postRows, agentRows, eventRows, resourceRows, pageRows, settingRows] = await Promise.all([
    db.select().from(houseboats).where(and(eq(houseboats.status, "active"), eq(houseboats.published, true), isNull(houseboats.archivedAt))).orderBy(asc(houseboats.displayOrder), asc(houseboats.nameEn)),
    db.select().from(leadership).where(eq(leadership.status, "current")).orderBy(asc(leadership.panel), asc(leadership.displayOrder)),
    db.select().from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.pinned), desc(posts.publishedAt)).limit(12),
    db.select().from(authorisedAgents).where(eq(authorisedAgents.status, "authorised")).orderBy(asc(authorisedAgents.displayOrder)),
    db.select().from(events).where(eq(events.published, true)).orderBy(desc(events.eventDate)),
    db.select().from(resources).where(eq(resources.published, true)).orderBy(asc(resources.displayOrder)),
    db.select().from(pages).where(eq(pages.published, true)),
    db.select().from(settings),
  ]);
  const districts = new Set(boatRows.map((boat) => boat.district).filter(Boolean));
  return {
    boats: boatRows.map(mapBoat),
    leadership: leaderRows.map(mapLeader),
    news: postRows.map(mapNews),
    agents: agentRows,
    events: eventRows,
    resources: resourceRows,
    pages: pageRows,
    settings: Object.fromEntries(settingRows.map((item) => [item.key, item.value])),
    stats: { registeredBoats: boatRows.length, activeMembers: boatRows.length, authorisedAgents: agentRows.length, operatingDistricts: districts.size },
  };
}

export async function getPublicBoat(slug: string): Promise<Boat | null> {
  await seedDatabase();
  const [row] = await getDb().select().from(houseboats).where(and(eq(houseboats.slug, slug), eq(houseboats.status, "active"), eq(houseboats.published, true), isNull(houseboats.archivedAt))).limit(1);
  return row ? mapBoat(row) : null;
}
