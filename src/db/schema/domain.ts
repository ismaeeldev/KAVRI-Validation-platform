import { pgTable, text, integer, timestamp, boolean, unique, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Helper for generating UUIDs natively
const uuidDefault = () => crypto.randomUUID();

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'owner' | 'tester'
  accountStatus: text("account_status").notNull(), // 'active' | 'deactivated'
  displayName: text("display_name").notNull(),
  emailNormalized: text("email_normalized").notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  name: text("name").notNull(),
  code: text("code").unique(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  notes: text("notes").notNull(),
  status: text("status").notNull(), // 'active' | 'archived'
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [
  index("suppliers_code_idx").on(table.code),
]);

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  internalName: text("internal_name").notNull(),
  publicAlias: text("public_alias"),
  descriptionInternal: text("description_internal").notNull(),
  publicSummary: text("public_summary"),
  status: text("status").notNull(), // 'active' | 'archived'
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productRevisions = pgTable("product_revisions", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  productId: text("product_id").notNull().references(() => products.id),
  revisionCode: text("revision_code").notNull(),
  revisionReason: text("revision_reason").notNull(),
  requestedChanges: text("requested_changes").notNull(),
  supplierReportedChanges: text("supplier_reported_changes").notNull(),
  internalNotes: text("internal_notes").notNull(),
  publicTitle: text("public_title"),
  publicSummary: text("public_summary"),
  developmentStage: text("development_stage").notNull(), // e.g. 'concept', 'design', 'prototype', etc.
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("product_id_revision_code_uq").on(table.productId, table.revisionCode),
]);

export const physicalSamples = pgTable("physical_samples", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  sampleCode: text("sample_code").notNull().unique(),
  productId: text("product_id").notNull().references(() => products.id),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
  receivingObservations: text("receiving_observations").notNull(),
  identifyingNotes: text("identifying_notes").notNull(),
  readinessNote: text("readiness_note").notNull(),
  status: text("status").notNull(), // 'received' | 'under_review' | 'ready_for_testing' | 'blocked' | 'rejected'
  statusChangedAt: timestamp("status_changed_at", { withTimezone: true }).notNull().defaultNow(),
  statusChangedBy: text("status_changed_by").notNull().references(() => user.id),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [
  index("physical_samples_code_idx").on(table.sampleCode),
]);

export const testerProfiles = pgTable("tester_profiles", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  userId: text("user_id").unique().references(() => user.id, { onDelete: "set null" }),
  emailNormalized: text("email_normalized").notNull().unique(),
  displayName: text("display_name").notNull(),
  approvalStatus: text("approval_status").notNull(), // 'pending' | 'approved' | 'deactivated'
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedBy: text("approved_by").references(() => user.id),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  deactivatedBy: text("deactivated_by").references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("tester_profiles_email_idx").on(table.emailNormalized),
]);

export const testerInvitations = pgTable("tester_invitations", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  testerProfileId: text("tester_profile_id").notNull().references(() => testerProfiles.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("tester_invitations_hash_idx").on(table.tokenHash),
]);

export const testingAssignments = pgTable("testing_assignments", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  testerProfileId: text("tester_profile_id").notNull().references(() => testerProfiles.id),
  testerUserId: text("tester_user_id").references(() => user.id),
  productId: text("product_id").notNull().references(() => products.id),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
  sampleId: text("sample_id").notNull().references(() => physicalSamples.id),
  instructions: text("instructions").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  requiredSessionCount: integer("required_session_count").notNull(),
  status: text("status").notNull(), // 'draft' | 'active' | 'acknowledged' | 'revoked' | 'expired'
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  activatedBy: text("activated_by").references(() => user.id),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedBy: text("revoked_by").references(() => user.id),
  revocationReason: text("revocation_reason"),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publicUpdates = pgTable("public_updates", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  productId: text("product_id").references(() => products.id),
  revisionId: text("revision_id").references(() => productRevisions.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  statusLabel: text("status_label").notNull(),
  developmentStage: text("development_stage"),
  publishedState: text("published_state").notNull(), // 'draft' | 'published' | 'archived'
  publishedAt: timestamp("published_at", { withTimezone: true }),
  unpublishedAt: timestamp("unpublished_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: text("created_by").notNull().references(() => user.id),
  updatedBy: text("updated_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const waitlistSubscribers = pgTable("waitlist_subscribers", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  email: text("email").notNull(),
  emailNormalized: text("email_normalized").notNull().unique(),
  signupSource: text("signup_source").notNull(),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull(), // 'active' | 'unsubscribed'
}, (table) => [
  index("waitlist_email_idx").on(table.emailNormalized),
]);

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(), // e.g., 'supplier.created', 'tester.approved'
  targetType: text("target_type").notNull(), // e.g. 'supplier', 'tester_profile'
  targetId: text("target_id").notNull(),
  metadataJson: text("metadata_json"), // Store minimal safe JSON as string
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

import { relations } from "drizzle-orm";

export const testerProfilesRelations = relations(testerProfiles, ({ many }) => ({
  invitations: many(testerInvitations),
}));

export const testerInvitationsRelations = relations(testerInvitations, ({ one }) => ({
  testerProfile: one(testerProfiles, {
    fields: [testerInvitations.testerProfileId],
    references: [testerProfiles.id],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  physicalSamples: many(physicalSamples),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  revisions: many(productRevisions),
}));

export const productRevisionsRelations = relations(productRevisions, ({ one, many }) => ({
  product: one(products, {
    fields: [productRevisions.productId],
    references: [products.id],
  }),
  physicalSamples: many(physicalSamples),
}));

export const physicalSamplesRelations = relations(physicalSamples, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [physicalSamples.supplierId],
    references: [suppliers.id],
  }),
  product: one(products, {
    fields: [physicalSamples.productId],
    references: [products.id],
  }),
  revision: one(productRevisions, {
    fields: [physicalSamples.revisionId],
    references: [productRevisions.id],
  }),
}));

export const testingAssignmentsRelations = relations(testingAssignments, ({ one }) => ({
  testerProfile: one(testerProfiles, {
    fields: [testingAssignments.testerProfileId],
    references: [testerProfiles.id],
  }),
  product: one(products, {
    fields: [testingAssignments.productId],
    references: [products.id],
  }),
  revision: one(productRevisions, {
    fields: [testingAssignments.revisionId],
    references: [productRevisions.id],
  }),
  sample: one(physicalSamples, {
    fields: [testingAssignments.sampleId],
    references: [physicalSamples.id],
  }),
}));

export const publicUpdatesRelations = relations(publicUpdates, ({ one }) => ({
  product: one(products, {
    fields: [publicUpdates.productId],
    references: [products.id],
  }),
  revision: one(productRevisions, {
    fields: [publicUpdates.revisionId],
    references: [productRevisions.id],
  }),
}));
