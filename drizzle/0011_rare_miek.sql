ALTER TABLE "waitlist_subscribers" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "utm_medium" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "cta_source" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "interest_type" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "tester_interest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "consent_text_version" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "application_skill_level" text;--> statement-breakpoint
ALTER TABLE "waitlist_subscribers" ADD COLUMN "application_notes" text;