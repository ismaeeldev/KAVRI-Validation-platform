CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"metadata_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "physical_samples" (
	"id" text PRIMARY KEY NOT NULL,
	"sample_code" text NOT NULL,
	"product_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"supplier_id" text NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"receiving_observations" text NOT NULL,
	"identifying_notes" text NOT NULL,
	"readiness_note" text NOT NULL,
	"status" text NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status_changed_by" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "physical_samples_sample_code_unique" UNIQUE("sample_code")
);
--> statement-breakpoint
CREATE TABLE "product_revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"revision_code" text NOT NULL,
	"revision_reason" text NOT NULL,
	"requested_changes" text NOT NULL,
	"supplier_reported_changes" text NOT NULL,
	"internal_notes" text NOT NULL,
	"public_title" text,
	"public_summary" text,
	"development_stage" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_id_revision_code_uq" UNIQUE("product_id","revision_code")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"supplier_id" text NOT NULL,
	"internal_name" text NOT NULL,
	"public_alias" text,
	"description_internal" text NOT NULL,
	"public_summary" text,
	"status" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "public_updates" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"revision_id" text,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"status_label" text NOT NULL,
	"development_stage" text,
	"published_state" text NOT NULL,
	"published_at" timestamp with time zone,
	"unpublished_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"contact_name" text,
	"contact_email" text,
	"notes" text NOT NULL,
	"status" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "suppliers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tester_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"tester_profile_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tester_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "tester_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email_normalized" text NOT NULL,
	"display_name" text NOT NULL,
	"approval_status" text NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" text,
	"deactivated_at" timestamp with time zone,
	"deactivated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tester_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "tester_profiles_email_normalized_unique" UNIQUE("email_normalized")
);
--> statement-breakpoint
CREATE TABLE "testing_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"tester_profile_id" text NOT NULL,
	"tester_user_id" text,
	"product_id" text NOT NULL,
	"revision_id" text NOT NULL,
	"sample_id" text NOT NULL,
	"instructions" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"required_session_count" integer NOT NULL,
	"status" text NOT NULL,
	"activated_at" timestamp with time zone,
	"activated_by" text,
	"acknowledged_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by" text,
	"revocation_reason" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"account_status" text NOT NULL,
	"display_name" text NOT NULL,
	"email_normalized" text NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "waitlist_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"signup_source" text NOT NULL,
	"consent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "waitlist_subscribers_email_normalized_unique" UNIQUE("email_normalized")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_status_changed_by_user_id_fk" FOREIGN KEY ("status_changed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_samples" ADD CONSTRAINT "physical_samples_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD CONSTRAINT "product_revisions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_revisions" ADD CONSTRAINT "product_revisions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_updates" ADD CONSTRAINT "public_updates_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_updates" ADD CONSTRAINT "public_updates_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_updates" ADD CONSTRAINT "public_updates_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_updates" ADD CONSTRAINT "public_updates_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_invitations" ADD CONSTRAINT "tester_invitations_tester_profile_id_tester_profiles_id_fk" FOREIGN KEY ("tester_profile_id") REFERENCES "public"."tester_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_invitations" ADD CONSTRAINT "tester_invitations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD CONSTRAINT "tester_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD CONSTRAINT "tester_profiles_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tester_profiles" ADD CONSTRAINT "tester_profiles_deactivated_by_user_id_fk" FOREIGN KEY ("deactivated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_tester_profile_id_tester_profiles_id_fk" FOREIGN KEY ("tester_profile_id") REFERENCES "public"."tester_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_tester_user_id_user_id_fk" FOREIGN KEY ("tester_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_revision_id_product_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."product_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_sample_id_physical_samples_id_fk" FOREIGN KEY ("sample_id") REFERENCES "public"."physical_samples"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_activated_by_user_id_fk" FOREIGN KEY ("activated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_revoked_by_user_id_fk" FOREIGN KEY ("revoked_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testing_assignments" ADD CONSTRAINT "testing_assignments_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "physical_samples_code_idx" ON "physical_samples" USING btree ("sample_code");--> statement-breakpoint
CREATE INDEX "suppliers_code_idx" ON "suppliers" USING btree ("code");--> statement-breakpoint
CREATE INDEX "tester_invitations_hash_idx" ON "tester_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "tester_profiles_email_idx" ON "tester_profiles" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "waitlist_email_idx" ON "waitlist_subscribers" USING btree ("email_normalized");