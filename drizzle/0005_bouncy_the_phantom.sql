CREATE TABLE "test_round_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"round_id" text NOT NULL,
	"revision_id" text NOT NULL,
	CONSTRAINT "round_id_revision_id_uq" UNIQUE("round_id","revision_id")
);
--> statement-breakpoint
CREATE TABLE "test_rounds" (
	"id" text PRIMARY KEY NOT NULL,
	"round_name" text NOT NULL,
	"round_code" text NOT NULL,
	"purpose" text NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"instructions" text NOT NULL,
	"required_session_count" integer NOT NULL,
	"required_forms" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"public_summary" text,
	"closeout_decision_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_rounds_round_code_unique" UNIQUE("round_code")
);
--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD COLUMN "round_id" text;--> statement-breakpoint
ALTER TABLE "test_round_revisions" ADD CONSTRAINT "test_round_revisions_round_id_test_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."test_rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_round_revisions" ADD CONSTRAINT "test_round_revisions_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_rounds" ADD CONSTRAINT "test_rounds_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "test_rounds_code_idx" ON "test_rounds" USING btree ("round_code");--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_round_id_test_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."test_rounds"("id") ON DELETE no action ON UPDATE no action;