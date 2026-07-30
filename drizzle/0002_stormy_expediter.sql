CREATE TABLE "product_certifications" (
	"id" text PRIMARY KEY NOT NULL,
	"revision_id" text NOT NULL,
	"governing_body" text NOT NULL,
	"status" text DEFAULT 'not_submitted' NOT NULL,
	"submission_date" date,
	"approval_date" date,
	"expiration_date" date,
	"approved_model_name" text,
	"reference_or_listing" text,
	"attachment_url" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "revision_id_governing_body_uq" UNIQUE("revision_id","governing_body")
);
--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "shape" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "performance_profile" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "firepower_balance" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "core_thickness_mm" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "overall_length_in" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "overall_width_in" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "handle_length_in" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "grip_circumference_in" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "handle_width_in" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "handle_depth_in" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_static_weight_min_g" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_static_weight_max_g" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_swing_weight" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_swing_weight_method" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_twist_weight" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_twist_weight_method" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "target_balance_point_mm" numeric;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "spin_rating" text DEFAULT 'not_yet_rated' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "spin_rating_source" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "spin_rating_date" date;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "spin_rating_confidence" text;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "feel_quadrant" text DEFAULT 'not_yet_assessed' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD COLUMN "public_state" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "shape" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "performance_profile" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "firepower_balance" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "public_state" text DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_certifications" ADD CONSTRAINT "product_certifications_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_certifications" ADD CONSTRAINT "product_certifications_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;