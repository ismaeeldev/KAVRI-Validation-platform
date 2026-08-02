ALTER TABLE "testing_assignments" ADD COLUMN "last_reminder_at" timestamp with time zone;--> statement-breakpoint
-- Data migration (Step 10, sprint1_rev.md item 2): rename the stored lifecycle value 'active' to
-- 'invited' to resolve a naming collision with the new computed (never stored) progress label
-- 'Active' meaning "testing underway" - a different concept from "invite dispatched."
UPDATE "testing_assignments" SET "status" = 'invited' WHERE "status" = 'active';