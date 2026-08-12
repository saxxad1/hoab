CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'administrator' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"before_json" text DEFAULT '' NOT NULL,
	"after_json" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authorised_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"agency_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"logo" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'authorised' NOT NULL,
	"valid_since" text DEFAULT '' NOT NULL,
	"expires_at" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "b2b_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_number" text NOT NULL,
	"agency_name" text NOT NULL,
	"agency_type" text NOT NULL,
	"year_established" text DEFAULT '' NOT NULL,
	"trade_license_number" text NOT NULL,
	"trade_association_name" text DEFAULT '' NOT NULL,
	"association_membership_number" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"facebook_url" text DEFAULT '' NOT NULL,
	"contact_name" text NOT NULL,
	"designation" text NOT NULL,
	"mobile" text NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"nid_number" text DEFAULT '' NOT NULL,
	"address" text NOT NULL,
	"district" text NOT NULL,
	"division" text DEFAULT '' NOT NULL,
	"business_type" text DEFAULT 'Travel Agency' NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"reviewer_email" text DEFAULT '' NOT NULL,
	"internal_note" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "b2b_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"document_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "boat_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text DEFAULT '' NOT NULL,
	"event_date" text NOT NULL,
	"start_time" text DEFAULT '' NOT NULL,
	"end_time" text DEFAULT '' NOT NULL,
	"venue" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_bn" text DEFAULT '' NOT NULL,
	"poster" text DEFAULT '' NOT NULL,
	"registration_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "houseboats" (
	"id" serial PRIMARY KEY NOT NULL,
	"membership_number" text NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text DEFAULT '' NOT NULL,
	"owner_name" text NOT NULL,
	"contact_number" text NOT NULL,
	"secondary_phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"facebook_url" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Wooden' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_bn" text DEFAULT '' NOT NULL,
	"capacity" integer DEFAULT 0 NOT NULL,
	"cabins" integer DEFAULT 0 NOT NULL,
	"air_conditioned" boolean DEFAULT false NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"district" text DEFAULT 'Sunamganj' NOT NULL,
	"operating_area" text DEFAULT 'Tanguar Haor' NOT NULL,
	"amenities" text DEFAULT '[]' NOT NULL,
	"cover_image" text DEFAULT '/images/hero-houseboat.jpg' NOT NULL,
	"gallery" text DEFAULT '[]' NOT NULL,
	"joining_date" text DEFAULT '' NOT NULL,
	"last_verified_at" text DEFAULT '' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leadership" (
	"id" serial PRIMARY KEY NOT NULL,
	"panel" text DEFAULT 'executive' NOT NULL,
	"term" text DEFAULT '2026–2028' NOT NULL,
	"name_en" text NOT NULL,
	"name_bn" text DEFAULT '' NOT NULL,
	"designation_en" text NOT NULL,
	"designation_bn" text DEFAULT '' NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"bio_en" text DEFAULT '' NOT NULL,
	"bio_bn" text DEFAULT '' NOT NULL,
	"photo" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'current' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"public_url" text NOT NULL,
	"original_name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_key" text NOT NULL,
	"title_en" text NOT NULL,
	"title_bn" text DEFAULT '' NOT NULL,
	"content_en" text DEFAULT '' NOT NULL,
	"content_bn" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"type" text DEFAULT 'news' NOT NULL,
	"category" text DEFAULT 'News' NOT NULL,
	"title_en" text NOT NULL,
	"title_bn" text DEFAULT '' NOT NULL,
	"excerpt_en" text DEFAULT '' NOT NULL,
	"excerpt_bn" text DEFAULT '' NOT NULL,
	"content_en" text DEFAULT '' NOT NULL,
	"content_bn" text DEFAULT '' NOT NULL,
	"featured_image" text DEFAULT '' NOT NULL,
	"attachment" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" text NOT NULL,
	"title_bn" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Guideline' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_bn" text DEFAULT '' NOT NULL,
	"file_url" text DEFAULT '' NOT NULL,
	"external_url" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "b2b_documents" ADD CONSTRAINT "b2b_documents_application_id_b2b_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."b2b_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_email_unique" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "agent_id_unique" ON "authorised_agents" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "agents_public_idx" ON "authorised_agents" USING btree ("status","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "b2b_reference_unique" ON "b2b_applications" USING btree ("reference_number");--> statement-breakpoint
CREATE INDEX "b2b_status_idx" ON "b2b_applications" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "b2b_lookup_idx" ON "b2b_applications" USING btree ("reference_number","email");--> statement-breakpoint
CREATE INDEX "b2b_documents_application_idx" ON "b2b_documents" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "enquiries_status_idx" ON "enquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "houseboats_membership_unique" ON "houseboats" USING btree ("membership_number");--> statement-breakpoint
CREATE UNIQUE INDEX "houseboats_slug_unique" ON "houseboats" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "houseboats_public_idx" ON "houseboats" USING btree ("status","published","archived_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_storage_key_unique" ON "media_assets" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "pages_key_unique" ON "pages" USING btree ("page_key");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_unique" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_public_idx" ON "posts" USING btree ("status","published_at");--> statement-breakpoint

-- All application data is server-only. The Vercel application connects with
-- DATABASE_URL; Supabase anon/authenticated REST clients receive no table access.
ALTER TABLE "admin_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "authorised_agents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "b2b_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "b2b_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "boat_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "enquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "houseboats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "leadership" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "resources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

REVOKE ALL ON TABLE "admin_users", "audit_logs", "authorised_agents", "b2b_applications", "b2b_documents", "boat_categories", "enquiries", "events", "houseboats", "leadership", "media_assets", "pages", "posts", "resources", "settings" FROM anon, authenticated;--> statement-breakpoint

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('public-media', 'public-media', true, 12582912, ARRAY['image/jpeg','image/png','image/webp','application/pdf']::text[]),
  ('b2b-documents', 'b2b-documents', false, 8388608, ARRAY['application/pdf','image/jpeg','image/png']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
