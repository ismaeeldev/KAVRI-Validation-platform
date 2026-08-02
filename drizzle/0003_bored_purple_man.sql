CREATE TABLE "photo_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"storage_url" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"caption" text
);
--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_static_weight_g" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_swing_weight" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_swing_weight_method" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_swing_weight_date" date;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_twist_weight" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_twist_weight_method" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_twist_weight_date" date;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_balance_point_mm" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_length_in" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_width_in" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "actual_handle_length_in" numeric;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_packaging_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_packaging_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_cosmetic_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_cosmetic_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_construction_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_construction_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_sound_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "inspection_sound_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "qr_value" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "short_code" text;--> statement-breakpoint
ALTER TABLE "photo_attachments" ADD CONSTRAINT "photo_attachments_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "photo_attachments_entity_idx" ON "photo_attachments" USING btree ("entity_type","entity_id");--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_qr_value_unique" UNIQUE("qr_value");--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_short_code_unique" UNIQUE("short_code");