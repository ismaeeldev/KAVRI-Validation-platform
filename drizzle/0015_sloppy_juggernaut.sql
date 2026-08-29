ALTER TABLE "evaluations" ADD COLUMN "reopened_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "evaluations" ADD COLUMN "reopened_by" text;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_reopened_by_user_id_fk" FOREIGN KEY ("reopened_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;