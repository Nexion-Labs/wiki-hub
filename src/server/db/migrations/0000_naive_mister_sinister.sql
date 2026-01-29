CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"permissions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"role_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"color" varchar(7),
	"icon" varchar(50),
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "wiki_page_categories" (
	"page_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wiki_page_tags" (
	"page_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wiki_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"content_markdown" text NOT NULL,
	"author_id" uuid NOT NULL,
	"current_version_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "wiki_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "wiki_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"content_markdown" text NOT NULL,
	"editor_id" uuid NOT NULL,
	"change_summary" text,
	"content_diff" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eol_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"version_id" uuid NOT NULL,
	"alert_days_before" integer DEFAULT 90 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eol_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"icon" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "eol_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "eol_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"vendor" varchar(255),
	"description" text,
	"category_id" uuid,
	"homepage_url" varchar(500),
	"documentation_url" varchar(500),
	"license" varchar(100),
	"icon_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "eol_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "eol_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"version_number" varchar(100) NOT NULL,
	"release_date" date,
	"eol_date" date NOT NULL,
	"extended_support_date" date,
	"lts" boolean DEFAULT false NOT NULL,
	"lifecycle_stage" varchar(50) NOT NULL,
	"notes" text,
	"migration_guide_page_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action_type" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_page_categories" ADD CONSTRAINT "wiki_page_categories_page_id_wiki_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_page_categories" ADD CONSTRAINT "wiki_page_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_page_tags" ADD CONSTRAINT "wiki_page_tags_page_id_wiki_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_page_tags" ADD CONSTRAINT "wiki_page_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_pages" ADD CONSTRAINT "wiki_pages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_versions" ADD CONSTRAINT "wiki_versions_page_id_wiki_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."wiki_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wiki_versions" ADD CONSTRAINT "wiki_versions_editor_id_users_id_fk" FOREIGN KEY ("editor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_alerts" ADD CONSTRAINT "eol_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_alerts" ADD CONSTRAINT "eol_alerts_version_id_eol_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."eol_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_products" ADD CONSTRAINT "eol_products_category_id_eol_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."eol_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_products" ADD CONSTRAINT "eol_products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_versions" ADD CONSTRAINT "eol_versions_product_id_eol_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."eol_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_versions" ADD CONSTRAINT "eol_versions_migration_guide_page_id_wiki_pages_id_fk" FOREIGN KEY ("migration_guide_page_id") REFERENCES "public"."wiki_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eol_versions" ADD CONSTRAINT "eol_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_categories_parent" ON "categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_categories_slug" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tags_slug" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tags_usage" ON "tags" USING btree ("usage_count");--> statement-breakpoint
CREATE INDEX "idx_wpc_page" ON "wiki_page_categories" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "idx_wpc_category" ON "wiki_page_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_wpt_page" ON "wiki_page_tags" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "idx_wpt_tag" ON "wiki_page_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "idx_wiki_pages_slug" ON "wiki_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_wiki_pages_author" ON "wiki_pages" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_wiki_pages_published" ON "wiki_pages" USING btree ("is_published","is_deleted");--> statement-breakpoint
CREATE INDEX "idx_wiki_versions_page" ON "wiki_versions" USING btree ("page_id","version_number");--> statement-breakpoint
CREATE INDEX "idx_wiki_versions_editor" ON "wiki_versions" USING btree ("editor_id");--> statement-breakpoint
CREATE INDEX "idx_eol_alerts_user" ON "eol_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_eol_alerts_version" ON "eol_alerts" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "idx_eol_products_slug" ON "eol_products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_eol_products_category" ON "eol_products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_eol_versions_product" ON "eol_versions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_eol_versions_eol_date" ON "eol_versions" USING btree ("eol_date");--> statement-breakpoint
CREATE INDEX "idx_eol_versions_lifecycle" ON "eol_versions" USING btree ("lifecycle_stage");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_user" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_entity" ON "activity_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_activity_logs_created" ON "activity_logs" USING btree ("created_at");