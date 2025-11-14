DO $$ BEGIN
 CREATE TYPE "post_status" AS ENUM('draft', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"slug" text NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_status_idx" ON "posts" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_created_by_idx" ON "posts" ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "posts_updated_by_idx" ON "posts" ("updated_by");