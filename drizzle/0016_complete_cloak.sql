ALTER TABLE "waitlist_subscribers" ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "klaviyo_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "klaviyo_sync_error" text;