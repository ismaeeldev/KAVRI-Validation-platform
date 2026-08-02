CREATE TABLE "evaluations" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"sample_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"round_id" text,
	"evaluation_type" text NOT NULL,
	"play_time_minutes" integer,
	"conditions" text,
	"comparison_reference" text,
	"score_control" integer,
	"score_stability" integer,
	"score_feel" integer,
	"score_comfort" integer,
	"score_consistency" integer,
	"score_overall_preference" integer,
	"score_power" integer,
	"score_spin" integer,
	"score_forgiveness" integer,
	"score_maneuverability" integer,
	"score_sound" integer,
	"score_fatigue" integer,
	"score_build_quality" integer,
	"strengths" text,
	"weaknesses" text,
	"preference" text,
	"confidence" text,
	"issue_triggered" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"last_saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "play_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"assignment_id" text NOT NULL,
	"session_date" date NOT NULL,
	"duration_minutes" integer,
	"conditions" text,
	"reference_paddle" text,
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_assignment_id_testing_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."testing_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_sample_id_physical_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."physical_samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_round_id_test_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."test_rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_assignment_id_testing_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."testing_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "play_sessions" ADD CONSTRAINT "play_sessions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "evaluations_assignment_idx" ON "evaluations" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "play_sessions_assignment_idx" ON "play_sessions" USING btree ("assignment_id");