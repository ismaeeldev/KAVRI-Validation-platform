import { pgTable, text, integer, numeric, date, timestamp, boolean, unique, index } from "drizzle-orm/pg-core";
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
  code: text("code").notNull().unique(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  notes: text("notes").notNull(),
  status: text("status").notNull(), // 'active' | 'archived' — archive/soft-delete flag, unrelated to relationshipStatus below
  supplierType: text("supplier_type"), // 'product' | 'packaging' | 'component' | 'other'
  website: text("website"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  region: text("region"),
  postalCode: text("postal_code"),
  country: text("country"),
  // Commercial relationship status (audit Section 8 "Status" field). Distinct from `status` above,
  // which is the archive/active soft-delete flag — do not conflate the two.
  relationshipStatus: text("relationship_status").notNull().default("under_evaluation"), // 'active' | 'under_evaluation' | 'inactive' | 'rejected'
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
  // Product-level defaults for shape/performance/firepower; a revision may override any of
  // these (see productRevisions) when the audit says "store on revision if shape can vary."
  shape: text("shape"), // 'elongated' | 'widebody' | 'hybrid' | 'other'
  performanceProfile: text("performance_profile"), // 'control' | 'all_court' | 'power' | 'undetermined'
  firepowerBalance: text("firepower_balance"), // 'power_leaning' | 'balanced' | 'pop_leaning' | 'undetermined'
  // Public exposure lifecycle (audit Section 8), distinct from `isPublic` and from
  // productRevisions.developmentStage (which is a pipeline stage, not exposure state).
  publicState: text("public_state").notNull().default("private"), // 'private' | 'candidate' | 'published' | 'archived'
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
  // Overrides of the product-level defaults above; null means "use the product default."
  shape: text("shape"),
  performanceProfile: text("performance_profile"),
  firepowerBalance: text("firepower_balance"),
  // Dimensions & construction (targets/configured values; actual measured values live on
  // physicalSamples, added in Step 4).
  coreThicknessMm: numeric("core_thickness_mm"),
  overallLengthIn: numeric("overall_length_in"),
  overallWidthIn: numeric("overall_width_in"),
  handleLengthIn: numeric("handle_length_in"), // category (Short/Medium/Long) derived in app code, not stored
  gripCircumferenceIn: numeric("grip_circumference_in"),
  handleWidthIn: numeric("handle_width_in"),
  handleDepthIn: numeric("handle_depth_in"),
  targetStaticWeightMinG: numeric("target_static_weight_min_g"),
  targetStaticWeightMaxG: numeric("target_static_weight_max_g"),
  targetSwingWeight: numeric("target_swing_weight"),
  targetSwingWeightMethod: text("target_swing_weight_method"),
  targetTwistWeight: numeric("target_twist_weight"),
  targetTwistWeightMethod: text("target_twist_weight_method"),
  targetBalancePointMm: numeric("target_balance_point_mm"),
  // Assessments - evolve over time, always freely editable regardless of the immutability guard.
  spinRating: text("spin_rating").notNull().default("not_yet_rated"), // elite|good|fair|poor|not_yet_rated
  spinRatingSource: text("spin_rating_source"),
  spinRatingDate: date("spin_rating_date"),
  spinRatingConfidence: text("spin_rating_confidence"),
  feelQuadrant: text("feel_quadrant").notNull().default("not_yet_assessed"), // a_stiff_dense|b_stiff_hollow|c_soft_dense|d_soft_hollow|not_yet_assessed
  // Public exposure lifecycle, distinct from developmentStage (pipeline) and isPublic (legacy flag).
  publicState: text("public_state").notNull().default("private"), // 'private' | 'candidate' | 'published' | 'archived'
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("product_id_revision_code_uq").on(table.productId, table.revisionCode),
]);

export const productCertifications = pgTable("product_certifications", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
  governingBody: text("governing_body").notNull(), // 'usap' | 'upa_a'
  status: text("status").notNull().default("not_submitted"), // not_submitted|preparing|submitted|approved|rejected|expired|withdrawn
  submissionDate: date("submission_date"),
  approvalDate: date("approval_date"),
  expirationDate: date("expiration_date"),
  approvedModelName: text("approved_model_name"),
  referenceOrListing: text("reference_or_listing"),
  attachmentUrl: text("attachment_url"), // wired up once Step 4's storage service exists
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("revision_id_governing_body_uq").on(table.revisionId, table.governingBody),
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
  status: text("status").notNull(), // received|under_review|ready_for_testing|blocked|rejected|assigned|returned|retired
  statusChangedAt: timestamp("status_changed_at", { withTimezone: true }).notNull().defaultNow(),
  statusChangedBy: text("status_changed_by").notNull().references(() => user.id),
  // Actual measured values (distinct from productRevisions' target/configured values).
  actualStaticWeightG: numeric("actual_static_weight_g"),
  actualSwingWeight: numeric("actual_swing_weight"),
  actualSwingWeightMethod: text("actual_swing_weight_method"),
  actualSwingWeightDate: date("actual_swing_weight_date"),
  actualTwistWeight: numeric("actual_twist_weight"),
  actualTwistWeightMethod: text("actual_twist_weight_method"),
  actualTwistWeightDate: date("actual_twist_weight_date"),
  actualBalancePointMm: numeric("actual_balance_point_mm"),
  actualLengthIn: numeric("actual_length_in"),
  actualWidthIn: numeric("actual_width_in"),
  actualHandleLengthIn: numeric("actual_handle_length_in"), // category derived in app code, not stored
  // Intake inspection checklist.
  inspectionPackagingOk: boolean("inspection_packaging_ok"),
  inspectionPackagingNotes: text("inspection_packaging_notes"),
  inspectionCosmeticOk: boolean("inspection_cosmetic_ok"),
  inspectionCosmeticNotes: text("inspection_cosmetic_notes"),
  inspectionConstructionOk: boolean("inspection_construction_ok"),
  inspectionConstructionNotes: text("inspection_construction_notes"),
  inspectionSoundOk: boolean("inspection_sound_ok"),
  inspectionSoundNotes: text("inspection_sound_notes"),
  // Identification for blind-test handling and mobile QR scan resolution.
  qrValue: text("qr_value").unique(),
  shortCode: text("short_code").unique(),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [
  index("physical_samples_code_idx").on(table.sampleCode),
]);

// Polymorphic photo storage, reused by Samples now and Issue Reports in Step 8.
export const photoAttachments = pgTable("photo_attachments", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  entityType: text("entity_type").notNull(), // 'sample' | 'issue_report'
  entityId: text("entity_id").notNull(),
  storageUrl: text("storage_url").notNull(),
  uploadedBy: text("uploaded_by").notNull().references(() => user.id),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
  caption: text("caption"),
}, (table) => [
  index("photo_attachments_entity_idx").on(table.entityType, table.entityId),
]);

export const testerProfiles = pgTable("tester_profiles", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  userId: text("user_id").unique().references(() => user.id, { onDelete: "set null" }),
  emailNormalized: text("email_normalized").notNull().unique(),
  displayName: text("display_name").notNull(),
  approvalStatus: text("approval_status").notNull(), // 'pending' | 'approved' | 'declined' | 'deactivated'
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedBy: text("approved_by").references(() => user.id),
  declinedAt: timestamp("declined_at", { withTimezone: true }),
  declinedBy: text("declined_by").references(() => user.id),
  declinedReason: text("declined_reason"),
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  deactivatedBy: text("deactivated_by").references(() => user.id),
  // Profile fields (audit Section 9) - all nullable, populated progressively.
  skillLevel: text("skill_level"), // 2.5|3.0|3.5|4.0|4.5|5.0_plus|not_sure
  playingFrequency: text("playing_frequency"), // daily|few_times_week|weekly|monthly_or_less
  currentPaddle: text("current_paddle"),
  playStyle: text("play_style"), // comma-separated controlled list (no multi-select precedent in this codebase)
  preferenceControlPower: text("preference_control_power"), // 'control'|'neutral'|'power' - audit's "Control/power" collapsed to one axis, see DataModelConfirmation.md
  preferencePop: text("preference_pop"), // 'more_pop'|'neutral'|'less_pop'
  preferenceFeel: text("preference_feel"), // 'stiffer'|'neutral'|'softer'
  preferenceHandle: text("preference_handle"),
  dominantHand: text("dominant_hand"), // left|right|ambidextrous|prefer_not_to_say
  singlesDoublesPreference: text("singles_doubles_preference"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentTextVersion: text("consent_text_version"),
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

export const closeoutDecisions = pgTable("closeout_decisions", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  scope: text("scope").notNull(), // 'round' | 'revision' | 'product'
  scopeId: text("scope_id").notNull(), // id of the round/revision/product this decision closes
  decision: text("decision").notNull(), // 'advance'|'modify'|'reject'|'gather_more_evidence'
  // A real field (not deferred) - Step 15's public "What Changed and Why" section and evidence-
  // strength indicator read directly from this column.
  evidenceStrength: text("evidence_strength"), // early_signal|directional_evidence|repeated_observation|strong_internal_confidence
  decisionSummary: text("decision_summary").notNull(),
  // Required when evidence is directional or incomplete - enforced via zod .refine() in the
  // validation schema, not a DB constraint (matches the codebase's established pattern).
  limitations: text("limitations"),
  openQuestions: text("open_questions"),
  nextAction: text("next_action").notNull(),
  // Separately controlled - only shown publicly once the linked round/revision's publicState
  // allows it.
  publicVersion: text("public_version"),
  decisionOwner: text("decision_owner").notNull().references(() => user.id),
  decisionDate: timestamp("decision_date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("closeout_decisions_scope_idx").on(table.scope, table.scopeId),
]);

export const closeoutEvidenceLinks = pgTable("closeout_evidence_links", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  closeoutDecisionId: text("closeout_decision_id").notNull().references(() => closeoutDecisions.id, { onDelete: "cascade" }),
  evidenceType: text("evidence_type").notNull(), // 'evaluation'|'issue_report'|'measurement'|'inspection'
  evidenceId: text("evidence_id").notNull(),
}, (table) => [
  index("closeout_evidence_links_decision_idx").on(table.closeoutDecisionId),
]);

export const testRounds = pgTable("test_rounds", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  roundName: text("round_name").notNull(),
  roundCode: text("round_code").notNull().unique(),
  purpose: text("purpose").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  instructions: text("instructions").notNull(),
  requiredSessionCount: integer("required_session_count").notNull(),
  // JSON-encoded { firstImpression: boolean, followUp: boolean, issueReport: boolean }
  requiredForms: text("required_forms").notNull(),
  status: text("status").notNull().default("draft"), // draft|recruiting|active|review|closed
  publicSummary: text("public_summary"),
  // Step 9 adds the real FK now that closeoutDecisions exists (was a plain nullable column in
  // Step 6, deliberately without a `.references()` constraint at the time).
  closeoutDecisionId: text("closeout_decision_id").references(() => closeoutDecisions.id),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("test_rounds_code_idx").on(table.roundCode),
]);

export const testRoundRevisions = pgTable("test_round_revisions", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  roundId: text("round_id").notNull().references(() => testRounds.id, { onDelete: "cascade" }),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
}, (table) => [
  unique("round_id_revision_id_uq").on(table.roundId, table.revisionId),
]);

export const testingAssignments = pgTable("testing_assignments", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  // Nullable at the column level (any pre-Step-10 assignment may have no round), but required by
  // the Step 10 createAssignment service function and the create-assignment form for every new
  // assignment going forward.
  roundId: text("round_id").references(() => testRounds.id),
  testerProfileId: text("tester_profile_id").notNull().references(() => testerProfiles.id),
  testerUserId: text("tester_user_id").references(() => user.id),
  productId: text("product_id").notNull().references(() => products.id),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
  sampleId: text("sample_id").notNull().references(() => physicalSamples.id),
  instructions: text("instructions").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  requiredSessionCount: integer("required_session_count").notNull(),
  // 'draft' | 'invited' | 'acknowledged' | 'revoked' | 'expired' - stored lifecycle only.
  // Renamed from 'active' to 'invited' in Step 10 to resolve a naming collision with the
  // computed (never stored) progress label 'Active' meaning "testing underway."
  status: text("status").notNull(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  activatedBy: text("activated_by").references(() => user.id),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedBy: text("revoked_by").references(() => user.id),
  revocationReason: text("revocation_reason"),
  lastReminderAt: timestamp("last_reminder_at", { withTimezone: true }),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const playSessions = pgTable("play_sessions", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  // Immutable after creation - no update path for this FK anywhere in the service layer.
  assignmentId: text("assignment_id").notNull().references(() => testingAssignments.id),
  sessionDate: date("session_date").notNull(),
  durationMinutes: integer("duration_minutes"),
  conditions: text("conditions"), // indoor/outdoor/ball/format, free text for Sprint 1
  referencePaddle: text("reference_paddle"),
  notes: text("notes"),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("play_sessions_assignment_idx").on(table.assignmentId),
]);

export const evaluations = pgTable("evaluations", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  assignmentId: text("assignment_id").notNull().references(() => testingAssignments.id),
  sampleId: text("sample_id").notNull().references(() => physicalSamples.id),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
  // Denormalized from assignment at creation time (copied, not derived live) so historical
  // evaluations remain correct even if an assignment's round somehow changes later.
  roundId: text("round_id").references(() => testRounds.id),
  evaluationType: text("evaluation_type").notNull(), // 'first_impression' | 'follow_up'
  playTimeMinutes: integer("play_time_minutes"),
  conditions: text("conditions"),
  comparisonReference: text("comparison_reference"), // 'current_paddle'|'candidate'|'expectation'
  // 1-5 scores, all nullable - "not every category mandatory" per audit.
  scoreControl: integer("score_control"),
  scoreStability: integer("score_stability"),
  scoreFeel: integer("score_feel"),
  scoreComfort: integer("score_comfort"),
  scoreConsistency: integer("score_consistency"),
  scoreOverallPreference: integer("score_overall_preference"),
  scorePower: integer("score_power"),
  scoreSpin: integer("score_spin"),
  scoreForgiveness: integer("score_forgiveness"),
  scoreManeuverability: integer("score_maneuverability"),
  scoreSound: integer("score_sound"),
  scoreFatigue: integer("score_fatigue"),
  scoreBuildQuality: integer("score_build_quality"),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  preference: text("preference"), // 'preferred'|'neutral'|'not_preferred'|'not_enough_evidence'
  confidence: text("confidence"), // 'low'|'medium'|'high'
  issueTriggered: boolean("issue_triggered").notNull().default(false),
  status: text("status").notNull().default("draft"), // 'draft'|'submitted'|'updated'
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  lastSavedAt: timestamp("last_saved_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: text("created_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("evaluations_assignment_idx").on(table.assignmentId),
]);

export const issueReports = pgTable("issue_reports", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  sampleId: text("sample_id").notNull().references(() => physicalSamples.id),
  revisionId: text("revision_id").notNull().references(() => productRevisions.id),
  // Nullable - an owner can also log an issue found during intake inspection, not only
  // tester-reported issues.
  assignmentId: text("assignment_id").references(() => testingAssignments.id),
  category: text("category").notNull(), // surface_wear|core_crush|delamination|edge_guard|handle|sound|cosmetic|packaging|other
  issueType: text("issue_type").notNull(), // 'cosmetic' | 'functional'
  severity: text("severity").notNull(), // 'low' | 'moderate' | 'high' | 'stop_use'
  firstObservedAt: date("first_observed_at").notNull(),
  description: text("description").notNull(),
  // Required only when issueType='functional' - enforced in the zod schema, not the DB.
  stillPlayable: text("still_playable"), // 'yes' | 'no' | 'unsure'
  immediateAction: text("immediate_action"), // 'continue'|'monitor'|'block'|'return'|'stop_use' - owner-set
  resolutionStatus: text("resolution_status").notNull().default("open"), // open|monitoring|resolved|closed
  resolutionNotes: text("resolution_notes"),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  reportedBy: text("reported_by").notNull().references(() => user.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("issue_reports_sample_idx").on(table.sampleId),
  index("issue_reports_revision_idx").on(table.revisionId),
]);

export const publicUpdates = pgTable("public_updates", {
  id: text("id").primaryKey().$defaultFn(uuidDefault),
  productId: text("product_id").references(() => products.id),
  revisionId: text("revision_id").references(() => productRevisions.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  statusLabel: text("status_label").notNull(),
  developmentStage: text("development_stage"),
  // 'draft'|'internal_review'|'approved'|'scheduled'|'published'|'archived' - expanded from the
  // original 3-value model in Step 13. Column stays text (no type change), matching this
  // project's established pattern of text columns + app-level enum validation.
  publishedState: text("published_state").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  unpublishedAt: timestamp("unpublished_at", { withTimezone: true }),
  // Scheduled publishing: set when transitioning to 'scheduled'; a Vercel Cron job auto-
  // transitions to 'published' once this timestamp has passed.
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  approvedBy: text("approved_by").references(() => user.id),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  // 4 distinct content fields the audit specifies separately from title/summary.
  observation: text("observation"), // "what was seen"
  evidenceLevel: text("evidence_level"), // 'early'|'directional'|'repeated'|'strong_internal'
  limitation: text("limitation"), // "what cannot yet be concluded"
  nextAction: text("next_action"), // "what happens next"
  // Signed preview access - never publicly guessable, generated on demand.
  previewToken: text("preview_token").unique(),
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
  // 'landing_page'|'tester_form'|'referral'|'other' - app-level enum (column stays text, matching
  // this project's established pattern). 'referral' overrides regardless of which form was used
  // whenever a `?ref=` param is present at signup; 'other' is reserved for future non-web paths
  // (e.g. a manual owner-added entry) and is not triggered by either public form in Step 14.
  signupSource: text("signup_source").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  ctaSource: text("cta_source"), // 'hero'|'navigation'|'footer'|'update'
  interestType: text("interest_type"), // 'development_updates'|'tester_opportunities'|'early_access'|'all'
  // Separate from approved tester status - this does NOT create a testerProfiles row, it is only
  // a signal on the waitlist record.
  testerInterest: boolean("tester_interest").notNull().default(false),
  consentTextVersion: text("consent_text_version"),
  // Populated only via the Apply to Test form (Step 14 item 3).
  name: text("name"),
  applicationSkillLevel: text("application_skill_level"),
  applicationNotes: text("application_notes"),
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
  certifications: many(productCertifications),
}));

export const productCertificationsRelations = relations(productCertifications, ({ one }) => ({
  revision: one(productRevisions, {
    fields: [productCertifications.revisionId],
    references: [productRevisions.id],
  }),
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

export const testingAssignmentsRelations = relations(testingAssignments, ({ one, many }) => ({
  round: one(testRounds, {
    fields: [testingAssignments.roundId],
    references: [testRounds.id],
  }),
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
  playSessions: many(playSessions),
  evaluations: many(evaluations),
}));

export const playSessionsRelations = relations(playSessions, ({ one }) => ({
  assignment: one(testingAssignments, {
    fields: [playSessions.assignmentId],
    references: [testingAssignments.id],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  assignment: one(testingAssignments, {
    fields: [evaluations.assignmentId],
    references: [testingAssignments.id],
  }),
  sample: one(physicalSamples, {
    fields: [evaluations.sampleId],
    references: [physicalSamples.id],
  }),
  revision: one(productRevisions, {
    fields: [evaluations.revisionId],
    references: [productRevisions.id],
  }),
  round: one(testRounds, {
    fields: [evaluations.roundId],
    references: [testRounds.id],
  }),
}));

export const testRoundsRelations = relations(testRounds, ({ many, one }) => ({
  roundRevisions: many(testRoundRevisions),
  assignments: many(testingAssignments),
  closeoutDecision: one(closeoutDecisions, {
    fields: [testRounds.closeoutDecisionId],
    references: [closeoutDecisions.id],
  }),
}));

export const closeoutDecisionsRelations = relations(closeoutDecisions, ({ many }) => ({
  evidenceLinks: many(closeoutEvidenceLinks),
}));

export const closeoutEvidenceLinksRelations = relations(closeoutEvidenceLinks, ({ one }) => ({
  closeoutDecision: one(closeoutDecisions, {
    fields: [closeoutEvidenceLinks.closeoutDecisionId],
    references: [closeoutDecisions.id],
  }),
}));

export const testRoundRevisionsRelations = relations(testRoundRevisions, ({ one }) => ({
  round: one(testRounds, {
    fields: [testRoundRevisions.roundId],
    references: [testRounds.id],
  }),
  revision: one(productRevisions, {
    fields: [testRoundRevisions.revisionId],
    references: [productRevisions.id],
  }),
}));

export const issueReportsRelations = relations(issueReports, ({ one }) => ({
  sample: one(physicalSamples, {
    fields: [issueReports.sampleId],
    references: [physicalSamples.id],
  }),
  revision: one(productRevisions, {
    fields: [issueReports.revisionId],
    references: [productRevisions.id],
  }),
  assignment: one(testingAssignments, {
    fields: [issueReports.assignmentId],
    references: [testingAssignments.id],
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
