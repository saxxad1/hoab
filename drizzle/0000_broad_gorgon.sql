CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'administrator' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`before_json` text DEFAULT '' NOT NULL,
	`after_json` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `authorised_agents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`agent_id` text NOT NULL,
	`agency_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`logo` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'authorised' NOT NULL,
	`valid_since` text DEFAULT '' NOT NULL,
	`expires_at` text DEFAULT '' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_id_unique` ON `authorised_agents` (`agent_id`);--> statement-breakpoint
CREATE TABLE `b2b_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference_number` text NOT NULL,
	`agency_name` text NOT NULL,
	`agency_type` text NOT NULL,
	`year_established` text DEFAULT '' NOT NULL,
	`trade_license_number` text NOT NULL,
	`trade_association_name` text DEFAULT '' NOT NULL,
	`association_membership_number` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`facebook_url` text DEFAULT '' NOT NULL,
	`contact_name` text NOT NULL,
	`designation` text NOT NULL,
	`mobile` text NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`email` text NOT NULL,
	`nid_number` text DEFAULT '' NOT NULL,
	`address` text NOT NULL,
	`district` text NOT NULL,
	`division` text DEFAULT '' NOT NULL,
	`business_type` text DEFAULT 'Travel Agency' NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`reviewer_email` text DEFAULT '' NOT NULL,
	`internal_note` text DEFAULT '' NOT NULL,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `b2b_reference_unique` ON `b2b_applications` (`reference_number`);--> statement-breakpoint
CREATE TABLE `b2b_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`document_type` text NOT NULL,
	`storage_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `boat_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name_en` text NOT NULL,
	`name_bn` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name_en` text NOT NULL,
	`name_bn` text DEFAULT '' NOT NULL,
	`event_date` text NOT NULL,
	`start_time` text DEFAULT '' NOT NULL,
	`end_time` text DEFAULT '' NOT NULL,
	`venue` text DEFAULT '' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_bn` text DEFAULT '' NOT NULL,
	`poster` text DEFAULT '' NOT NULL,
	`registration_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'upcoming' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `houseboats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`membership_number` text NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_bn` text DEFAULT '' NOT NULL,
	`owner_name` text NOT NULL,
	`contact_number` text NOT NULL,
	`secondary_phone` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`facebook_url` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'Wooden' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_bn` text DEFAULT '' NOT NULL,
	`capacity` integer DEFAULT 0 NOT NULL,
	`cabins` integer DEFAULT 0 NOT NULL,
	`air_conditioned` integer DEFAULT false NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`district` text DEFAULT 'Sunamganj' NOT NULL,
	`operating_area` text DEFAULT 'Tanguar Haor' NOT NULL,
	`amenities` text DEFAULT '[]' NOT NULL,
	`cover_image` text DEFAULT '/images/hero-houseboat.jpg' NOT NULL,
	`gallery` text DEFAULT '[]' NOT NULL,
	`joining_date` text DEFAULT '' NOT NULL,
	`last_verified_at` text DEFAULT '' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`seo_title` text DEFAULT '' NOT NULL,
	`seo_description` text DEFAULT '' NOT NULL,
	`archived_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `houseboats_membership_unique` ON `houseboats` (`membership_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `houseboats_slug_unique` ON `houseboats` (`slug`);--> statement-breakpoint
CREATE TABLE `leadership` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`panel` text DEFAULT 'executive' NOT NULL,
	`term` text DEFAULT '2026–2028' NOT NULL,
	`name_en` text NOT NULL,
	`name_bn` text DEFAULT '' NOT NULL,
	`designation_en` text NOT NULL,
	`designation_bn` text DEFAULT '' NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`bio_en` text DEFAULT '' NOT NULL,
	`bio_bn` text DEFAULT '' NOT NULL,
	`photo` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'current' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_key` text NOT NULL,
	`title_en` text NOT NULL,
	`title_bn` text DEFAULT '' NOT NULL,
	`content_en` text DEFAULT '' NOT NULL,
	`content_bn` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_key_unique` ON `pages` (`page_key`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`type` text DEFAULT 'news' NOT NULL,
	`category` text DEFAULT 'News' NOT NULL,
	`title_en` text NOT NULL,
	`title_bn` text DEFAULT '' NOT NULL,
	`excerpt_en` text DEFAULT '' NOT NULL,
	`excerpt_bn` text DEFAULT '' NOT NULL,
	`content_en` text DEFAULT '' NOT NULL,
	`content_bn` text DEFAULT '' NOT NULL,
	`featured_image` text DEFAULT '' NOT NULL,
	`attachment` text DEFAULT '' NOT NULL,
	`published_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_en` text NOT NULL,
	`title_bn` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'Guideline' NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_bn` text DEFAULT '' NOT NULL,
	`file_url` text DEFAULT '' NOT NULL,
	`external_url` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
