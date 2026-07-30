-- Backfill any NULL supplier code before enforcing NOT NULL, so this migration
-- never fails against production data. As of this migration's authoring, all
-- 5 production suppliers already have a code (verified against
-- backups/pre-sprint1-rev-baseline-*.json); this UPDATE is a defensive no-op
-- today and a safety net against any future drift before this migration runs.
UPDATE "suppliers" SET "code" = 'SUP-' || upper(substr(replace("id"::text, '-', ''), 1, 8)) WHERE "code" IS NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "supplier_type" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "address_line1" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "address_line2" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "relationship_status" text DEFAULT 'under_evaluation' NOT NULL;