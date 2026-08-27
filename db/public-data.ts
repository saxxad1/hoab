import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { getDb } from ".";
import { authorisedAgents, events, houseboats, leadership, pages, posts, resources, settings } from "./schema";
import type { Boat, Leader, NewsItem, PublicData } from "../app/data";
import { getDemoPublicData } from "./demo-data";

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
    membership: row.membershipNumber,
    type: row.category,
    status: row.status,
    district: row.district,
    operatingArea: row.operatingArea,
    capacity: row.capacity,
    cabins: row.cabins,
    acRooms: row.acRooms ?? 0,
    nonAcRooms: row.nonAcRooms ?? 0,
    attachedWashrooms: row.attachedWashrooms ?? 0,
    commonWashrooms: row.commonWashrooms ?? 0,
    startingPrice: row.startingPrice ?? 0,
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
    verified: row.lastVerifiedAt,
    featured: row.featured,
    amenities: jsonArray(row.amenities),
  };
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function mapLeader(row: typeof leadership.$inferSelect): Leader {
  return { id: row.id, panel: row.panel as "executive" | "advisory", term: row.term, name: row.nameEn, role: row.designationEn, organization: row.organization, bio: row.bioEn, photo: row.photo, initials: initials(row.nameEn) };
}

function mapNews(row: typeof posts.$inferSelect): NewsItem {
  return { id: row.id, slug: row.slug, category: row.category, date: row.publishedAt, title: row.titleEn, excerpt: row.excerptEn, content: row.contentEn, featuredImage: row.featuredImage, attachment: row.attachment, pinned: row.pinned };
}

export async function getPublicData(): Promise<PublicData> {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") return getDemoPublicData();
  const db = getDb();
  // Supabase's transaction pooler must not receive multiple pipelined queries
  // over the same postgres.js connection. Keep this workload sequential.
  const boatRows = await db.select().from(houseboats).where(and(eq(houseboats.status, "active"), eq(houseboats.published, true), isNull(houseboats.archivedAt))).orderBy(asc(houseboats.displayOrder), asc(houseboats.nameEn));
  const leaderRows = await db.select().from(leadership).where(eq(leadership.status, "current")).orderBy(asc(leadership.panel), asc(leadership.displayOrder));
  const postRows = await db.select().from(posts).where(eq(posts.status, "published")).orderBy(desc(posts.pinned), desc(posts.publishedAt)).limit(12);
  const agentRows = await db.select().from(authorisedAgents).where(eq(authorisedAgents.status, "authorised")).orderBy(asc(authorisedAgents.displayOrder));
  const eventRows = await db.select().from(events).where(eq(events.published, true)).orderBy(desc(events.eventDate));
  const resourceRows = await db.select().from(resources).where(eq(resources.published, true)).orderBy(asc(resources.displayOrder));
  const pageRows = await db.select().from(pages).where(eq(pages.published, true));
  const settingRows = await db.select().from(settings);
  const districts = new Set(boatRows.map((boat) => boat.district).filter(Boolean));
  return {
    boats: boatRows.map(mapBoat),
    leadership: leaderRows.map(mapLeader),
    news: postRows.map(mapNews),
    agents: agentRows,
    events: eventRows.map((row) => ({ id: row.id, name: row.nameEn, eventDate: row.eventDate, startTime: row.startTime, endTime: row.endTime, venue: row.venue, description: row.descriptionEn, poster: row.poster, registrationUrl: row.registrationUrl, status: row.status })),
    resources: resourceRows.map((row) => ({ id: row.id, title: row.titleEn, category: row.category, description: row.descriptionEn, fileUrl: row.fileUrl, externalUrl: row.externalUrl, displayOrder: row.displayOrder })),
    pages: pageRows.map((row) => ({ id: row.id, pageKey: row.pageKey, title: row.titleEn, content: row.contentEn })),
    settings: Object.fromEntries(settingRows.filter((item) => !item.key.endsWith("_bn")).map((item) => [item.key, item.value])),
    stats: { registeredBoats: boatRows.length, activeMembers: boatRows.length, authorisedAgents: agentRows.length, operatingDistricts: districts.size },
  };
}

export async function getPublicBoat(slug: string): Promise<Boat | null> {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") return getDemoPublicData().boats.find((boat) => boat.slug === slug) ?? null;
  const [row] = await getDb().select().from(houseboats).where(and(eq(houseboats.slug, slug), eq(houseboats.status, "active"), eq(houseboats.published, true), isNull(houseboats.archivedAt))).limit(1);
  return row ? mapBoat(row) : null;
}
