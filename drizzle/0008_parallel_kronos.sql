CREATE TABLE "closeout_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"scope_id" text NOT NULL,
	"decision" text NOT NULL,
	"evidence_strength" text,
	"decision_summary" text NOT NULL,
	"limitations" text,
	"open_questions" text,
	"next_action" text NOT NULL,
	"public_version" text,
	"decision_owner" text NOT NULL,
	"decision_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "closeout_evidence_links" (
	"id" text PRIMARY KEY NOT NULL,
	"closeout_decision_id" text NOT NULL,
	"evidence_type" text NOT NULL,
	"evidence_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "closeout_decisions" ADD CONSTRAINT "closeout_decisions_decision_owner_user_id_fk" FOREIGN KEY ("decision_owner") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "closeout_evidence_links" ADD CONSTRAINT "closeout_evidence_links_closeout_decision_id_closeout_decisions_id_fk" FOREIGN KEY ("closeout_decision_id") REFERENCES "public"."closeout_decisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "closeout_decisions_scope_idx" ON "closeout_decisions" USING btree ("scope","scope_id");--> statement-breakpoint
CREATE INDEX "closeout_evidence_links_decision_idx" ON "closeout_evidence_links" USING btree ("closeout_decision_id");--> statement-breakpoint
ALTER TABLE "test_rounds" ADD CONSTRAINT "test_rounds_closeout_decision_id_closeout_decisions_id_fk" FOREIGN KEY ("closeout_decision_id") REFERENCES "public"."closeout_decisions"("id") ON DELETE no action ON UPDATE no action;