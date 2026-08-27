import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
};

export const boatCategories = pgTable("boat_categories", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  active: boolean("active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const houseboats = pgTable("houseboats", {
  id: serial("id").primaryKey(),
  membershipNumber: text("membership_number").notNull(),
  slug: text("slug").notNull(),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull().default(""),
  ownerName: text("owner_name").notNull(),
  ownerPhoto: text("owner_photo").notNull().default(""),
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
  acRooms: integer("ac_rooms").notNull().default(0),
  nonAcRooms: integer("non_ac_rooms").notNull().default(0),
  attachedWashrooms: integer("attached_washrooms").notNull().default(0),
  commonWashrooms: integer("common_washrooms").notNull().default(0),
  startingPrice: integer("starting_price").notNull().default(0),
  airConditioned: boolean("air_conditioned").notNull().default(false),
  address: text("address").notNull().default(""),
  district: text("district").notNull().default("Sunamganj"),
  operatingArea: text("operating_area").notNull().default("Tanguar Haor"),
  amenities: text("amenities").notNull().default("[]"),
  coverImage: text("cover_image").notNull().default("/images/hero-houseboat.jpg"),
  gallery: text("gallery").notNull().default("[]"),
  joiningDate: text("joining_date").notNull().default(""),
  lastVerifiedAt: text("last_verified_at").notNull().default(""),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "string" }),
  ...timestamps,
}, (table) => [
  uniqueIndex("houseboats_membership_unique").on(table.membershipNumber),
  uniqueIndex("houseboats_slug_unique").on(table.slug),
  index("houseboats_public_idx").on(table.status, table.published, table.archivedAt),
]);

export const leadership = pgTable("leadership", {
  id: serial("id").primaryKey(),
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

export const b2bApplications = pgTable("b2b_applications", {
  id: serial("id").primaryKey(),
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
  submissionTokenHash: text("submission_token_hash").notNull().default(""),
  uploadCompletedAt: timestamp("upload_completed_at", { withTimezone: true, mode: "string" }),
  submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("b2b_reference_unique").on(table.referenceNumber),
  index("b2b_status_idx").on(table.status, table.submittedAt),
  index("b2b_lookup_idx").on(table.referenceNumber, table.email),
]);

export const b2bDocuments = pgTable("b2b_documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => b2bApplications.id, { onDelete: "cascade" }),
  documentType: text("document_type").notNull(),
  storageKey: text("storage_key").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [index("b2b_documents_application_idx").on(table.applicationId)]);

export const authorisedAgents = pgTable("authorised_agents", {
  id: serial("id").primaryKey(),
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
}, (table) => [
  uniqueIndex("agent_id_unique").on(table.agentId),
  index("agents_public_idx").on(table.status, table.displayOrder),
]);

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
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
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  status: text("status").notNull().default("published"),
  pinned: boolean("pinned").notNull().default(false),
  ...timestamps,
}, (table) => [
  uniqueIndex("posts_slug_unique").on(table.slug),
  index("posts_public_idx").on(table.status, table.publishedAt),
]);

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
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
  published: boolean("published").notNull().default(true),
  ...timestamps,
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleBn: text("title_bn").notNull().default(""),
  category: text("category").notNull().default("Guideline"),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionBn: text("description_bn").notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  externalUrl: text("external_url").notNull().default(""),
  published: boolean("published").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  ...timestamps,
});

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [index("enquiries_status_idx").on(table.status, table.createdAt)]);

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  pageKey: text("page_key").notNull(),
  titleEn: text("title_en").notNull(),
  titleBn: text("title_bn").notNull().default(""),
  contentEn: text("content_en").notNull().default(""),
  contentBn: text("content_bn").notNull().default(""),
  published: boolean("published").notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("pages_key_unique").on(table.pageKey)]);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  role: text("role").notNull().default("administrator"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [uniqueIndex("admin_email_unique").on(table.email)]);

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull().default(""),
  summary: text("summary").notNull().default(""),
  beforeJson: text("before_json").notNull().default(""),
  afterJson: text("after_json").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [index("audit_logs_created_idx").on(table.createdAt)]);

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  storageKey: text("storage_key").notNull(),
  publicUrl: text("public_url").notNull(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [uniqueIndex("media_storage_key_unique").on(table.storageKey)]);
