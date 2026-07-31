import * as zod from "zod";
import {
  DEVELOPMENT_STAGE,
  SUPPLIER_TYPE,
  SUPPLIER_RELATIONSHIP_STATUS,
  PUBLIC_STATE,
  SHAPE,
  PERFORMANCE_PROFILE,
  FIREPOWER_BALANCE,
  SPIN_RATING,
  FEEL_QUADRANT,
  CERTIFICATION_STATUS,
  GOVERNING_BODY,
  SKILL_LEVEL,
  PLAYING_FREQUENCY,
  PREFERENCE_CONTROL_POWER,
  PREFERENCE_POP,
  PREFERENCE_FEEL,
  DOMINANT_HAND,
  ROUND_STATUS,
  EVALUATION_TYPE,
  COMPARISON_REFERENCE,
  EVALUATION_PREFERENCE,
  EVALUATION_CONFIDENCE,
  EVALUATION_SCORE_FIELDS,
  ISSUE_CATEGORY,
  ISSUE_TYPE,
  ISSUE_SEVERITY,
  STILL_PLAYABLE,
  IMMEDIATE_ACTION,
  ISSUE_RESOLUTION_STATUS,
  PUBLIC_UPDATE_STATE,
  UPDATE_EVIDENCE_LEVEL,
  CLOSEOUT_SCOPE,
  CLOSEOUT_DECISION,
  EVIDENCE_STRENGTH,
  EVIDENCE_TYPE,
  LIMITATIONS_REQUIRED_EVIDENCE_STRENGTHS,
  CTA_SOURCE,
  INTEREST_TYPE,
} from "../constants";

// react-hook-form's `valueAsNumber` turns an empty optional number input into NaN, not
// undefined; normalize that here so `.optional()` behaves as expected for every target/
// measurement field below (used across products/revisions here and samples in Step 4).
const optionalNumber = () =>
  zod.preprocess(
    (val) => (val === "" || val === undefined || (typeof val === "number" && Number.isNaN(val)) ? undefined : val),
    zod.number().optional()
  );

export const createSupplierSchema = zod.object({
  name: zod.string().trim().min(1, "Supplier name is required"),
  code: zod
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Code must be at most 10 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must be alphanumeric uppercase, dash, or underscore"),
  contactName: zod.string().trim().optional(),
  contactEmail: zod.string().trim().toLowerCase().email("Invalid email address").optional().or(zod.literal("")),
  notes: zod.string().trim().min(1, "Internal notes are required"),
  supplierType: zod.enum(Object.values(SUPPLIER_TYPE) as [string, ...string[]]).optional().or(zod.literal("")),
  website: zod.string().trim().url("Enter a valid URL, e.g. https://example.com").optional().or(zod.literal("")),
  phone: zod.string().trim().optional().or(zod.literal("")),
  addressLine1: zod.string().trim().optional().or(zod.literal("")),
  addressLine2: zod.string().trim().optional().or(zod.literal("")),
  city: zod.string().trim().optional().or(zod.literal("")),
  region: zod.string().trim().optional().or(zod.literal("")),
  postalCode: zod.string().trim().optional().or(zod.literal("")),
  country: zod.string().trim().optional().or(zod.literal("")),
  relationshipStatus: zod
    .enum(Object.values(SUPPLIER_RELATIONSHIP_STATUS) as [string, ...string[]])
    .default(SUPPLIER_RELATIONSHIP_STATUS.UNDER_EVALUATION),
});

export const updateSupplierSchema = createSupplierSchema;

export const createProductSchema = zod.object({
  supplierId: zod.string().min(1, "Supplier is required"),
  internalName: zod.string().trim().min(1, "Internal product name is required"),
  publicAlias: zod.string().trim().optional().or(zod.literal("")),
  descriptionInternal: zod.string().trim().min(1, "Internal description is required"),
  publicSummary: zod.string().trim().optional().or(zod.literal("")),
  isPublic: zod.boolean().default(false),
  shape: zod.enum(Object.values(SHAPE) as [string, ...string[]]).optional().or(zod.literal("")),
  performanceProfile: zod.enum(Object.values(PERFORMANCE_PROFILE) as [string, ...string[]]).optional().or(zod.literal("")),
  firepowerBalance: zod.enum(Object.values(FIREPOWER_BALANCE) as [string, ...string[]]).optional().or(zod.literal("")),
  publicState: zod.enum(Object.values(PUBLIC_STATE) as [string, ...string[]]).default(PUBLIC_STATE.PRIVATE),
});

export const updateProductSchema = createProductSchema;

// Spec-defining fields: locked once a physical sample references the revision, unless the
// caller passes isControlledCorrection=true (see product-service.ts updateRevision).
export const REVISION_SPEC_FIELDS = [
  "shape",
  "coreThicknessMm",
  "overallLengthIn",
  "overallWidthIn",
  "handleLengthIn",
  "gripCircumferenceIn",
  "handleWidthIn",
  "handleDepthIn",
  "targetStaticWeightMinG",
  "targetStaticWeightMaxG",
  "targetSwingWeight",
  "targetTwistWeight",
  "targetBalancePointMm",
] as const;

const revisionSpecFields = {
  shape: zod.enum(Object.values(SHAPE) as [string, ...string[]]).optional().or(zod.literal("")),
  performanceProfile: zod.enum(Object.values(PERFORMANCE_PROFILE) as [string, ...string[]]).optional().or(zod.literal("")),
  firepowerBalance: zod.enum(Object.values(FIREPOWER_BALANCE) as [string, ...string[]]).optional().or(zod.literal("")),
  coreThicknessMm: optionalNumber(),
  overallLengthIn: optionalNumber(),
  overallWidthIn: optionalNumber(),
  handleLengthIn: optionalNumber(),
  gripCircumferenceIn: optionalNumber(),
  handleWidthIn: optionalNumber(),
  handleDepthIn: optionalNumber(),
  targetStaticWeightMinG: optionalNumber(),
  targetStaticWeightMaxG: optionalNumber(),
  targetSwingWeight: optionalNumber(),
  targetSwingWeightMethod: zod.string().trim().optional().or(zod.literal("")),
  targetTwistWeight: optionalNumber(),
  targetTwistWeightMethod: zod.string().trim().optional().or(zod.literal("")),
  targetBalancePointMm: optionalNumber(),
};

const revisionAssessmentFields = {
  spinRating: zod.enum(Object.values(SPIN_RATING) as [string, ...string[]]).default(SPIN_RATING.NOT_YET_RATED),
  spinRatingSource: zod.string().trim().optional().or(zod.literal("")),
  spinRatingDate: zod.string().trim().optional().or(zod.literal("")),
  spinRatingConfidence: zod.string().trim().optional().or(zod.literal("")),
  feelQuadrant: zod.enum(Object.values(FEEL_QUADRANT) as [string, ...string[]]).default(FEEL_QUADRANT.NOT_YET_ASSESSED),
  publicState: zod.enum(Object.values(PUBLIC_STATE) as [string, ...string[]]).default(PUBLIC_STATE.PRIVATE),
};

export const createRevisionSchema = zod.object({
  productId: zod.string().min(1, "Product is required"),
  revisionCode: zod.string().trim().toUpperCase().min(1, "Revision code is required"),
  revisionReason: zod.string().trim().min(1, "Revision reason is required"),
  requestedChanges: zod.string().trim().min(1, "Requested changes is required"),
  supplierReportedChanges: zod.string().trim().min(1, "Supplier-reported changes is required"),
  internalNotes: zod.string().trim().optional().or(zod.literal("")),
  publicTitle: zod.string().trim().optional().or(zod.literal("")),
  publicSummary: zod.string().trim().optional().or(zod.literal("")),
  developmentStage: zod.nativeEnum(DEVELOPMENT_STAGE),
  isPublic: zod.boolean().default(false),
  ...revisionSpecFields,
  ...revisionAssessmentFields,
});

// Same shape as create, plus the controlled-correction escape hatch for spec fields once a
// sample already references the revision (see product-service.ts updateRevision).
export const updateRevisionSchema = zod.object({
  revisionReason: zod.string().trim().min(1, "Revision reason is required"),
  requestedChanges: zod.string().trim().min(1, "Requested changes is required"),
  supplierReportedChanges: zod.string().trim().min(1, "Supplier-reported changes is required"),
  internalNotes: zod.string().trim().optional().or(zod.literal("")),
  publicTitle: zod.string().trim().optional().or(zod.literal("")),
  publicSummary: zod.string().trim().optional().or(zod.literal("")),
  developmentStage: zod.nativeEnum(DEVELOPMENT_STAGE),
  isPublic: zod.boolean().default(false),
  ...revisionSpecFields,
  ...revisionAssessmentFields,
  isControlledCorrection: zod.boolean().default(false),
});

export const createCertificationSchema = zod.object({
  revisionId: zod.string().min(1, "Revision is required"),
  governingBody: zod.enum(Object.values(GOVERNING_BODY) as [string, ...string[]]),
  status: zod.enum(Object.values(CERTIFICATION_STATUS) as [string, ...string[]]).default(CERTIFICATION_STATUS.NOT_SUBMITTED),
  submissionDate: zod.string().trim().optional().or(zod.literal("")),
  approvalDate: zod.string().trim().optional().or(zod.literal("")),
  expirationDate: zod.string().trim().optional().or(zod.literal("")),
  approvedModelName: zod.string().trim().optional().or(zod.literal("")),
  referenceOrListing: zod.string().trim().optional().or(zod.literal("")),
});

export const updateCertificationStatusSchema = zod.object({
  status: zod.enum(Object.values(CERTIFICATION_STATUS) as [string, ...string[]]),
  submissionDate: zod.string().trim().optional().or(zod.literal("")),
  approvalDate: zod.string().trim().optional().or(zod.literal("")),
  expirationDate: zod.string().trim().optional().or(zod.literal("")),
  approvedModelName: zod.string().trim().optional().or(zod.literal("")),
  referenceOrListing: zod.string().trim().optional().or(zod.literal("")),
});

const sampleMeasurementFields = {
  actualStaticWeightG: optionalNumber(),
  actualSwingWeight: optionalNumber(),
  actualSwingWeightMethod: zod.string().trim().optional().or(zod.literal("")),
  actualSwingWeightDate: zod.string().trim().optional().or(zod.literal("")),
  actualTwistWeight: optionalNumber(),
  actualTwistWeightMethod: zod.string().trim().optional().or(zod.literal("")),
  actualTwistWeightDate: zod.string().trim().optional().or(zod.literal("")),
  actualBalancePointMm: optionalNumber(),
  actualLengthIn: optionalNumber(),
  actualWidthIn: optionalNumber(),
  actualHandleLengthIn: optionalNumber(),
};

export const updateSampleMeasurementsSchema = zod.object(sampleMeasurementFields);

const sampleInspectionFields = {
  inspectionPackagingOk: zod.boolean().optional(),
  inspectionPackagingNotes: zod.string().trim().optional().or(zod.literal("")),
  inspectionCosmeticOk: zod.boolean().optional(),
  inspectionCosmeticNotes: zod.string().trim().optional().or(zod.literal("")),
  inspectionConstructionOk: zod.boolean().optional(),
  inspectionConstructionNotes: zod.string().trim().optional().or(zod.literal("")),
  inspectionSoundOk: zod.boolean().optional(),
  inspectionSoundNotes: zod.string().trim().optional().or(zod.literal("")),
};

export const updateSampleInspectionSchema = zod.object(sampleInspectionFields);

export const createSampleSchema = zod.object({
  sampleCode: zod.string().trim().toUpperCase().min(1, "Sample code is required").regex(/^[A-Z0-9_-]+$/, "Sample code must be alphanumeric uppercase, dash, or underscore"),
  supplierId: zod.string().min(1, "Supplier is required"),
  productId: zod.string().min(1, "Product is required"),
  revisionId: zod.string().min(1, "Revision is required"),
  receivedAt: zod.string().min(1, "Received date is required"),
  receivingObservations: zod.string().trim().min(1, "Receiving observations are required"),
  identifyingNotes: zod.string().trim().optional().or(zod.literal("")),
  ...sampleMeasurementFields,
  ...sampleInspectionFields,
});

export const transitionStatusSchema = zod.object({
  status: zod.string().min(1, "Status is required"),
  readinessNote: zod.string().trim().min(1, "Readiness / transition note is required"),
});

const testerProfileFields = {
  skillLevel: zod.enum(Object.values(SKILL_LEVEL) as [string, ...string[]]).optional().or(zod.literal("")),
  playingFrequency: zod.enum(Object.values(PLAYING_FREQUENCY) as [string, ...string[]]).optional().or(zod.literal("")),
  currentPaddle: zod.string().trim().optional().or(zod.literal("")),
  playStyle: zod.array(zod.string()).optional().default([]),
  preferenceControlPower: zod.enum(Object.values(PREFERENCE_CONTROL_POWER) as [string, ...string[]]).optional().or(zod.literal("")),
  preferencePop: zod.enum(Object.values(PREFERENCE_POP) as [string, ...string[]]).optional().or(zod.literal("")),
  preferenceFeel: zod.enum(Object.values(PREFERENCE_FEEL) as [string, ...string[]]).optional().or(zod.literal("")),
  preferenceHandle: zod.string().trim().optional().or(zod.literal("")),
  dominantHand: zod.enum(Object.values(DOMINANT_HAND) as [string, ...string[]]).optional().or(zod.literal("")),
  singlesDoublesPreference: zod.string().trim().optional().or(zod.literal("")),
};

export const createTesterSchema = zod.object({
  name: zod.string().trim().min(1, "Tester name is required"),
  email: zod.string().trim().toLowerCase().email("Invalid email address"),
  ...testerProfileFields,
});

export const updateTesterProfileSchema = zod.object(testerProfileFields);

export const declineTesterSchema = zod.object({
  reason: zod.string().trim().min(1, "A reason for declining is required"),
});

export const acceptInvitationSchema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string().min(8, "Confirmation password must be at least 8 characters"),
  consentGiven: zod.boolean().refine((v) => v === true, { message: "Consent is required before testing." }),
  consentTextVersion: zod.string().trim().min(1, "Consent version is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createAssignmentSchema = zod.object({
  roundId: zod.string().min(1, "Test round is required"),
  testerProfileId: zod.string().min(1, "Tester profile is required"),
  sampleId: zod.string().min(1, "Physical sample is required"),
  instructions: zod.string().trim().min(1, "Instructions are required"),
  dueAt: zod.string().min(1, "Due date is required"),
  requiredSessionCount: zod.number().int().min(1, "Required session count must be at least 1"),
  forceAssign: zod.boolean().optional().default(false),
});

export const revokeAssignmentSchema = zod.object({
  reason: zod.string().trim().min(1, "Revocation reason is required"),
});

// State is deliberately NOT part of this content schema - every transition (Send to Review,
// Approve, Schedule, Publish, Archive, Send Back) is a dedicated action with its own validation
// (see transitionPublicUpdateSchema below), matching the same pattern already used for
// assignment/sample/round status controls elsewhere in this codebase.
export const createPublicUpdateSchema = zod.object({
  title: zod.string().trim().min(1, "Title is required"),
  summary: zod.string().trim().min(1, "Summary is required"),
  statusLabel: zod.string().trim().min(1, "Status label is required"),
  developmentStage: zod.nativeEnum(DEVELOPMENT_STAGE).optional().or(zod.literal("")),
  productId: zod.string().optional().or(zod.literal("")),
  revisionId: zod.string().optional().or(zod.literal("")),
  sortOrder: zod.number().int().default(0),
  // Distinct from title/summary - the audit lists these as 4 separate content fields.
  observation: zod.string().trim().optional().or(zod.literal("")),
  evidenceLevel: zod.enum(Object.values(UPDATE_EVIDENCE_LEVEL) as [string, ...string[]]).optional().or(zod.literal("")),
  limitation: zod.string().trim().optional().or(zod.literal("")),
  nextAction: zod.string().trim().optional().or(zod.literal("")),
});

export const transitionPublicUpdateSchema = zod.object({
  status: zod.enum(Object.values(PUBLIC_UPDATE_STATE) as [string, ...string[]]),
  scheduledFor: zod.string().trim().optional().or(zod.literal("")),
});

export const createCloseoutDecisionSchema = zod
  .object({
    scope: zod.enum(Object.values(CLOSEOUT_SCOPE) as [string, ...string[]]),
    scopeId: zod.string().min(1, "Scope id is required"),
    decision: zod.enum(Object.values(CLOSEOUT_DECISION) as [string, ...string[]]),
    evidenceStrength: zod.enum(Object.values(EVIDENCE_STRENGTH) as [string, ...string[]]).optional().or(zod.literal("")),
    decisionSummary: zod.string().trim().min(1, "Decision summary is required"),
    limitations: zod.string().trim().optional().or(zod.literal("")),
    openQuestions: zod.string().trim().optional().or(zod.literal("")),
    nextAction: zod.string().trim().min(1, "Next action is required"),
    publicVersion: zod.string().trim().optional().or(zod.literal("")),
    evidenceLinks: zod
      .array(
        zod.object({
          evidenceType: zod.enum(Object.values(EVIDENCE_TYPE) as [string, ...string[]]),
          evidenceId: zod.string().min(1),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) =>
      !(
        data.decision === "gather_more_evidence" ||
        (data.evidenceStrength && LIMITATIONS_REQUIRED_EVIDENCE_STRENGTHS.has(data.evidenceStrength))
      ) || !!data.limitations,
    {
      message: "Limitations are required when evidence is directional/incomplete or the decision is 'gather more evidence'",
      path: ["limitations"],
    }
  );

export const waitlistSignupSchema = zod.object({
  email: zod.string().trim().toLowerCase().email("Invalid email address"),
  honeypot: zod.string().optional(),
  ctaSource: zod.enum(Object.values(CTA_SOURCE) as [string, ...string[]]).optional().or(zod.literal("")),
  interestType: zod.enum(Object.values(INTEREST_TYPE) as [string, ...string[]]).optional().or(zod.literal("")),
  utmSource: zod.string().trim().optional().or(zod.literal("")),
  utmMedium: zod.string().trim().optional().or(zod.literal("")),
  utmCampaign: zod.string().trim().optional().or(zod.literal("")),
  ref: zod.string().trim().optional().or(zod.literal("")),
  consentTextVersion: zod.string().trim().optional().or(zod.literal("")),
});

// Genuinely separate from the general waitlist form (audit D-06: a deliberately separate
// conversion path, never a checkbox bolted onto the general signup).
export const testerApplicationSchema = zod.object({
  name: zod.string().trim().min(1, "Name is required"),
  email: zod.string().trim().toLowerCase().email("Invalid email address"),
  skillLevel: zod.enum(Object.values(SKILL_LEVEL) as [string, ...string[]]).optional().or(zod.literal("")),
  applicationNotes: zod.string().trim().max(2000).optional().or(zod.literal("")),
  consentGiven: zod.boolean().refine((v) => v === true, { message: "Consent is required to apply." }),
  consentTextVersion: zod.string().trim().min(1, "Consent version is required"),
  honeypot: zod.string().optional(),
  utmSource: zod.string().trim().optional().or(zod.literal("")),
  utmMedium: zod.string().trim().optional().or(zod.literal("")),
  utmCampaign: zod.string().trim().optional().or(zod.literal("")),
  ref: zod.string().trim().optional().or(zod.literal("")),
});

export const createRoundSchema = zod.object({
  roundName: zod.string().trim().min(1, "Round name is required"),
  roundCode: zod
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Code must be at least 2 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must be alphanumeric uppercase, dash, or underscore"),
  purpose: zod.string().trim().min(1, "Purpose is required — what decision this round should support"),
  startAt: zod.string().trim().optional().or(zod.literal("")),
  endAt: zod.string().trim().optional().or(zod.literal("")),
  instructions: zod.string().trim().min(1, "Tester-facing instructions are required"),
  requiredSessionCount: zod.number().int().min(1, "Required session count must be at least 1"),
  requiredFormFirstImpression: zod.boolean().default(true),
  requiredFormFollowUp: zod.boolean().default(true),
  requiredFormIssueReport: zod.boolean().default(false),
  publicSummary: zod.string().trim().optional().or(zod.literal("")),
  revisionIds: zod.array(zod.string()).optional().default([]),
});

export const updateRoundSchema = createRoundSchema.omit({ roundCode: true, revisionIds: true });

export const transitionRoundStatusSchema = zod.object({
  status: zod.enum(Object.values(ROUND_STATUS) as [string, ...string[]]),
});

// Score fields are rendered as native <select> elements, so incoming values arrive as strings
// (unlike text/number inputs elsewhere that use RHF's valueAsNumber) - coerce here rather than
// relying on the client to convert.
const optionalScore = () =>
  zod.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const n = typeof val === "string" ? Number(val) : val;
    return typeof n === "number" && Number.isNaN(n) ? undefined : n;
  }, zod.number().int().min(1).max(5).optional());

const evaluationScoreFields = Object.fromEntries(
  EVALUATION_SCORE_FIELDS.map(({ key }) => [key, optionalScore()])
) as Record<(typeof EVALUATION_SCORE_FIELDS)[number]["key"], ReturnType<typeof optionalScore>>;

export const createPlaySessionSchema = zod.object({
  sessionDate: zod.string().min(1, "Session date is required"),
  durationMinutes: optionalNumber(),
  conditions: zod.string().trim().optional().or(zod.literal("")),
  referencePaddle: zod.string().trim().optional().or(zod.literal("")),
  notes: zod.string().trim().optional().or(zod.literal("")),
});

export const createIssueReportSchema = zod
  .object({
    sampleId: zod.string().min(1, "Sample is required"),
    assignmentId: zod.string().optional().or(zod.literal("")),
    evaluationId: zod.string().optional().or(zod.literal("")),
    category: zod.enum(Object.values(ISSUE_CATEGORY) as [string, ...string[]]),
    issueType: zod.enum(Object.values(ISSUE_TYPE) as [string, ...string[]]),
    severity: zod.enum(Object.values(ISSUE_SEVERITY) as [string, ...string[]]),
    firstObservedAt: zod.string().min(1, "First observed date is required"),
    description: zod.string().trim().min(1, "Description is required"),
    stillPlayable: zod.enum(Object.values(STILL_PLAYABLE) as [string, ...string[]]).optional().or(zod.literal("")),
  })
  .refine((data) => data.issueType !== "functional" || !!data.stillPlayable, {
    message: "Still-playable is required for functional issues",
    path: ["stillPlayable"],
  });

export const updateIssueResolutionSchema = zod.object({
  immediateAction: zod.enum(Object.values(IMMEDIATE_ACTION) as [string, ...string[]]).optional().or(zod.literal("")),
  resolutionStatus: zod.enum(Object.values(ISSUE_RESOLUTION_STATUS) as [string, ...string[]]),
  resolutionNotes: zod.string().trim().optional().or(zod.literal("")),
});

export const evaluationDraftSchema = zod.object({
  evaluationType: zod.enum(Object.values(EVALUATION_TYPE) as [string, ...string[]]),
  playTimeMinutes: optionalNumber(),
  conditions: zod.string().trim().optional().or(zod.literal("")),
  comparisonReference: zod.enum(Object.values(COMPARISON_REFERENCE) as [string, ...string[]]).optional().or(zod.literal("")),
  ...evaluationScoreFields,
  strengths: zod.string().trim().optional().or(zod.literal("")),
  weaknesses: zod.string().trim().optional().or(zod.literal("")),
  preference: zod.enum(Object.values(EVALUATION_PREFERENCE) as [string, ...string[]]).optional().or(zod.literal("")),
  confidence: zod.enum(Object.values(EVALUATION_CONFIDENCE) as [string, ...string[]]).optional().or(zod.literal("")),
  issueTriggered: zod.boolean().default(false),
});

