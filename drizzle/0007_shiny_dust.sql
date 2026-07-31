CREATE TABLE "issue_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"sample_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"assignment_id" text,
	"category" text NOT NULL,
	"issue_type" text NOT NULL,
	"severity" text NOT NULL,
	"first_observed_at" date NOT NULL,
	"description" text NOT NULL,
	"still_playable" text,
	"immediate_action" text,
	"resolution_status" text DEFAULT 'open' NOT NULL,
	"resolution_notes" text,
	"closed_at" timestamp with time zone,
	"reported_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_sample_id_physical_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."physical_samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_assignment_id_testing_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."testing_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_reported_by_user_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_reports_sample_idx" ON "issue_reports" USING btree ("sample_id");--> statement-breakpoint
CREATE INDEX "issue_reports_revision_idx" ON "issue_reports" USING btree ("revision_id");