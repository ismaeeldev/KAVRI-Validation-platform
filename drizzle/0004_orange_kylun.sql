ALTER TABLE "tester_profiles" ADD COLUMN "declined_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "declined_by" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "declined_reason" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "skill_level" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "playing_frequency" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "current_paddle" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "play_style" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "preference_control_power" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "preference_pop" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "preference_feel" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "preference_handle" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "dominant_hand" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "singles_doubles_preference" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "consent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD COLUMN "consent_text_version" text;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD CONSTRAINT "tester_profiles_declined_by_user_id_fk" FOREIGN KEY ("declined_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;