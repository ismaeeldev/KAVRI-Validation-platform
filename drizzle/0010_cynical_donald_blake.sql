ALTER TABLE "public_updates" ADD COLUMN "scheduled_for" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "observation" text;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "evidence_level" text;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "limitation" text;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "next_action" text;--> statement-breakpoint
ALTER TABLE "public_updates" ADD COLUMN "preview_token" text;--> statement-breakpoint
ALTER TABLE "public_updates" ADD CONSTRAINT "public_updates_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_updates" ADD CONSTRAINT "public_updates_preview_token_unique" UNIQUE("preview_token");