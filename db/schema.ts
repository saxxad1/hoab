import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const boatCategories = sqliteTable("boat_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const houseboats = sqliteTable("houseboats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  membershipNumber: text("membership_number").notNull(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  ownerName: text("owner_name").notNull(),
  contactNumber: text("contact_number").notNull(),
  secondaryPhone: text("secondary_phone").notNull().default(""),
  email: text("email").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  website: text("website").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  category: text("category").notNull().default("Wooden"),
  status: text("status").notNull().default("active"),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionBn: text("description_bn").notNull().default(""),
  capacity: integer("capacity").notNull().default(0),
  cabins: integer("cabins").notNull().default(0),
  airConditioned: integer("air_conditioned", { mode: "boolean" }).notNull().default(false),
  address: text("address").notNull().default(""),
  district: text("district").notNull().default("Sunamganj"),
  operatingArea: text("operating_area").notNull().default("Tanguar Haor"),
  amenities: text("amenities").notNull().default("[]"),
  coverImage: text("cover_image").notNull().default("/images/hero-houseboat.jpg"),
  gallery: text("gallery").notNull().default("[]"),
  joiningDate: text("joining_date").notNull().default(""),
  lastVerifiedAt: text("last_verified_at").notNull().default(""),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  archivedAt: text("archived_at"),
  ...timestamps,
}, (table) => [
  uniqueIndex("houseboats_membership_unique").on(table.membershipNumber),
  uniqueIndex("houseboats_slug_unique").on(table.slug),
]);

export const leadership = sqliteTable("leadership", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  panel: text("panel").notNull().default("executive"),
  term: text("term").notNull().default("2026–2028"),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  designationEn: text("designation_en").notNull(),
  designationBn: text("designation_bn").notNull().default(""),
  organization: text("organization").notNull().default(""),
  bioEn: text("bio_en").notNull().default(""),
  bioBn: text("bio_bn").notNull().default(""),
  photo: text("photo").notNull().default(""),
  status: text("status").notNull().default("current"),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const b2bApplications = sqliteTable("b2b_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referenceNumber: text("reference_number").notNull(),
  agencyName: text("agency_name").notNull(),
  agencyType: text("agency_type").notNull(),
  yearEstablished: text("year_established").notNull().default(""),
  tradeLicenseNumber: text("trade_license_number").notNull(),
  tradeAssociationName: text("trade_association_name").notNull().default(""),
  associationMembershipNumber: text("association_membership_number").notNull().default(""),
  website: text("website").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  contactName: text("contact_name").notNull(),
  designation: text("designation").notNull(),
  mobile: text("mobile").notNull(),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull(),
  nidNumber: text("nid_number").notNull().default(""),
  address: text("address").notNull(),
  district: text("district").notNull(),
  division: text("division").notNull().default(""),
  businessType: text("business_type").notNull().default("Travel Agency"),
  status: text("status").notNull().default("submitted"),
  reviewerEmail: text("reviewer_email").notNull().default(""),
  internalNote: text("internal_note").notNull().default(""),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("b2b_reference_unique").on(table.referenceNumber)]);

export const b2bDocuments = sqliteTable("b2b_documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  applicationId: integer("application_id").notNull(),
  documentType: text("document_type").notNull(),
  storageKey: text("storage_key").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const authorisedAgents = sqliteTable("authorised_agents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agentId: text("agent_id").notNull(),
  agencyName: text("agency_name").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  website: text("website").notNull().default(""),
  location: text("location").notNull().default(""),
  logo: text("logo").notNull().default(""),
  status: text("status").notNull().default("authorised"),
  validSince: text("valid_since").notNull().default(""),
  expiresAt: text("expires_at").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
}, (table) => [uniqueIndex("agent_id_unique").on(table.agentId)]);

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  type: text("type").notNull().default("news"),
  category: text("category").notNull().default("News"),
  titleEn: text("title_en").notNull(),
  titleBn: text("title_bn").notNull().default(""),
  excerptEn: text("excerpt_en").notNull().default(""),
  excerptBn: text("excerpt_bn").notNull().default(""),
  contentEn: text("content_en").notNull().default(""),
  contentBn: text("content_bn").notNull().default(""),
  featuredImage: text("featured_image").notNull().default(""),
  attachment: text("attachment").notNull().default(""),
  publishedAt: text("published_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  status: text("status").notNull().default("published"),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
}, (table) => [uniqueIndex("posts_slug_unique").on(table.slug)]);

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  eventDate: text("event_date").notNull(),
  startTime: text("start_time").notNull().default(""),
  endTime: text("end_time").notNull().default(""),
  venue: text("venue").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionBn: text("description_bn").notNull().default(""),
  poster: text("poster").notNull().default(""),
  registrationUrl: text("registration_url").notNull().default(""),
  status: text("status").notNull().default("upcoming"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titleEn: text("title_en").notNull(),
  titleBn: text("title_bn").notNull().default(""),
  category: text("category").notNull().default("Guideline"),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionBn: text("description_bn").notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  externalUrl: text("external_url").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageKey: text("page_key").notNull(),
  titleEn: text("title_en").notNull(),
  titleBn: text("title_bn").notNull().default(""),
  contentEn: text("content_en").notNull().default(""),
  contentBn: text("content_bn").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("pages_key_unique").on(table.pageKey)]);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  role: text("role").notNull().default("administrator"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("admin_email_unique").on(table.email)]);

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull().default(""),
  summary: text("summary").notNull().default(""),
  beforeJson: text("before_json").notNull().default(""),
  afterJson: text("after_json").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mediaAssets = sqliteTable("media_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storageKey: text("storage_key").notNull(),
  publicUrl: text("public_url").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("media_storage_key_unique").on(table.storageKey)]);
