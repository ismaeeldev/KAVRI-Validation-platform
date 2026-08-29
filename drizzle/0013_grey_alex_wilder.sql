ALTER TABLE "physical_samples" ADD COLUMN "returned_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_received_by" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_packaging_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_packaging_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_cosmetic_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_cosmetic_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_construction_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_construction_notes" text;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_sound_ok" boolean;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD COLUMN "return_inspection_sound_notes" text;