// Shared domain constants and TypeScript types

export const ROLES = {
  OWNER: "owner",
  TESTER: "tester",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ACCOUNT_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  DEACTIVATED: "deactivated",
} as const;

export type AccountStatus = typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];

export const TESTER_APPROVAL = {
  PENDING: "pending",
  APPROVED: "approved",
  DECLINED: "declined", // owner-only action, available only while approvalStatus='pending'
  DEACTIVATED: "deactivated", // matches audit's "Inactive" - same meaning, no rename needed
} as const;

export type TesterApproval = typeof TESTER_APPROVAL[keyof typeof TESTER_APPROVAL];

export const SKILL_LEVEL = {
  L2_5: "2.5",
  L3_0: "3.0",
  L3_5: "3.5",
  L4_0: "4.0",
  L4_5: "4.5",
  L5_0_PLUS: "5.0_plus",
  NOT_SURE: "not_sure",
} as const;

export type SkillLevel = typeof SKILL_LEVEL[keyof typeof SKILL_LEVEL];

export const PLAYING_FREQUENCY = {
  DAILY: "daily",
  FEW_TIMES_WEEK: "few_times_week",
  WEEKLY: "weekly",
  MONTHLY_OR_LESS: "monthly_or_less",
} as const;

export type PlayingFrequency = typeof PLAYING_FREQUENCY[keyof typeof PLAYING_FREQUENCY];

// Audit lists "Control / power" as related but separately named preference axes; consolidated
// here into one control-vs-power scale per sprint1_rev.md Step 5's explicit allowance -
// documented in the Step 5 commit rather than silently dropping one dimension.
export const PREFERENCE_CONTROL_POWER = {
  CONTROL: "control",
  NEUTRAL: "neutral",
  POWER: "power",
} as const;

export type PreferenceControlPower = typeof PREFERENCE_CONTROL_POWER[keyof typeof PREFERENCE_CONTROL_POWER];

export const PREFERENCE_POP = {
  MORE_POP: "more_pop",
  NEUTRAL: "neutral",
  LESS_POP: "less_pop",
} as const;

export type PreferencePop = typeof PREFERENCE_POP[keyof typeof PREFERENCE_POP];

export const PREFERENCE_FEEL = {
  STIFFER: "stiffer",
  NEUTRAL: "neutral",
  SOFTER: "softer",
} as const;

export type PreferenceFeel = typeof PREFERENCE_FEEL[keyof typeof PREFERENCE_FEEL];

export const DOMINANT_HAND = {
  LEFT: "left",
  RIGHT: "right",
  AMBIDEXTROUS: "ambidextrous",
  PREFER_NOT_TO_SAY: "prefer_not_to_say",
} as const;

export type DominantHand = typeof DOMINANT_HAND[keyof typeof DOMINANT_HAND];

export const PLAY_STYLE_OPTIONS = [
  "aggressive_baseline",
  "dinker",
  "net_rusher",
  "all_court",
  "power_hitter",
  "defensive",
] as const;

export const SUPPLIER_TYPE = {
  PRODUCT: "product",
  PACKAGING: "packaging",
  COMPONENT: "component",
  OTHER: "other",
} as const;

export type SupplierType = typeof SUPPLIER_TYPE[keyof typeof SUPPLIER_TYPE];

export const SUPPLIER_RELATIONSHIP_STATUS = {
  ACTIVE: "active",
  UNDER_EVALUATION: "under_evaluation",
  INACTIVE: "inactive",
  REJECTED: "rejected",
} as const;

export type SupplierRelationshipStatus = typeof SUPPLIER_RELATIONSHIP_STATUS[keyof typeof SUPPLIER_RELATIONSHIP_STATUS];

export const SAMPLE_STATUS = {
  RECEIVED: "received",
  UNDER_REVIEW: "under_review",
  READY_FOR_TESTING: "ready_for_testing",
  BLOCKED: "blocked",
  REJECTED: "rejected",
  ASSIGNED: "assigned", // system-triggered only (Step 10), never owner-clickable
  RETURNED: "returned",
  RETIRED: "retired",
} as const;

export type SampleStatus = typeof SAMPLE_STATUS[keyof typeof SAMPLE_STATUS];

export const PHOTO_ENTITY_TYPE = {
  SAMPLE: "sample",
  ISSUE_REPORT: "issue_report", // used starting Step 8; table built polymorphic upfront
} as const;

export type PhotoEntityType = typeof PHOTO_ENTITY_TYPE[keyof typeof PHOTO_ENTITY_TYPE];

// Stored lifecycle only. Renamed ACTIVE -> INVITED in Step 10 (sprint1_rev.md) to resolve a
// naming collision with the computed (never stored) progress label 'Active' meaning "testing
// underway" - see ASSIGNMENT_COMPUTED_STATUS below.
export const ASSIGNMENT_STATUS = {
  DRAFT: "draft",
  INVITED: "invited",
  ACKNOWLEDGED: "acknowledged",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

export type AssignmentStatus = typeof ASSIGNMENT_STATUS[keyof typeof ASSIGNMENT_STATUS];

// Computed display-only progress status, layered on top of the stored 'acknowledged' state.
// Never persisted as a column value - safe to reuse the word 'active' here since it can never
// collide with the renamed stored 'invited' state above.
export const ASSIGNMENT_COMPUTED_STATUS = {
  FIRST_IMPRESSION_DUE: "first_impression_due",
  ACTIVE: "active",
  FOLLOW_UP_DUE: "follow_up_due",
  COMPLETE: "complete",
} as const;

export type AssignmentComputedStatus = typeof ASSIGNMENT_COMPUTED_STATUS[keyof typeof ASSIGNMENT_COMPUTED_STATUS];

// Expanded from 3 to 6 states in Step 13 (sprint1_rev.md).
export const PUBLIC_UPDATE_STATE = {
  DRAFT: "draft",
  INTERNAL_REVIEW: "internal_review",
  APPROVED: "approved",
  SCHEDULED: "scheduled",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type PublicUpdateState = typeof PUBLIC_UPDATE_STATE[keyof typeof PUBLIC_UPDATE_STATE];

// Same 4-tier scale as Step 9's closeoutDecisions.evidenceStrength, named per the audit's
// slightly different wording for this context.
export const UPDATE_EVIDENCE_LEVEL = {
  EARLY: "early",
  DIRECTIONAL: "directional",
  REPEATED: "repeated",
  STRONG_INTERNAL: "strong_internal",
} as const;

export type UpdateEvidenceLevel = typeof UPDATE_EVIDENCE_LEVEL[keyof typeof UPDATE_EVIDENCE_LEVEL];

export const DEVELOPMENT_STAGE = {
  CONCEPT: "concept",
  DESIGN: "design",
  PROTOTYPE: "prototype",
  FIELD_TESTING: "field_testing",
  PRODUCTION: "production",
  LAUNCH: "launch",
} as const;

export type DevelopmentStage = typeof DEVELOPMENT_STAGE[keyof typeof DEVELOPMENT_STAGE];

// Public exposure lifecycle for products/revisions (audit Section 8), distinct from
// DEVELOPMENT_STAGE (an internal pipeline stage) and from the legacy `isPublic` boolean.
export const PUBLIC_STATE = {
  PRIVATE: "private",
  CANDIDATE: "candidate",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type PublicState = typeof PUBLIC_STATE[keyof typeof PUBLIC_STATE];

export const SHAPE = {
  ELONGATED: "elongated",
  WIDEBODY: "widebody",
  HYBRID: "hybrid",
  OTHER: "other",
} as const;

export type Shape = typeof SHAPE[keyof typeof SHAPE];

export const PERFORMANCE_PROFILE = {
  CONTROL: "control",
  ALL_COURT: "all_court",
  POWER: "power",
  UNDETERMINED: "undetermined",
} as const;

export type PerformanceProfile = typeof PERFORMANCE_PROFILE[keyof typeof PERFORMANCE_PROFILE];

export const FIREPOWER_BALANCE = {
  POWER_LEANING: "power_leaning",
  BALANCED: "balanced",
  POP_LEANING: "pop_leaning",
  UNDETERMINED: "undetermined",
} as const;

export type FirepowerBalance = typeof FIREPOWER_BALANCE[keyof typeof FIREPOWER_BALANCE];

export const SPIN_RATING = {
  ELITE: "elite",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor",
  NOT_YET_RATED: "not_yet_rated",
} as const;

export type SpinRating = typeof SPIN_RATING[keyof typeof SPIN_RATING];

export const FEEL_QUADRANT = {
  A_STIFF_DENSE: "a_stiff_dense",
  B_STIFF_HOLLOW: "b_stiff_hollow",
  C_SOFT_DENSE: "c_soft_dense",
  D_SOFT_HOLLOW: "d_soft_hollow",
  NOT_YET_ASSESSED: "not_yet_assessed",
} as const;

export type FeelQuadrant = typeof FEEL_QUADRANT[keyof typeof FEEL_QUADRANT];

export const CERTIFICATION_STATUS = {
  NOT_SUBMITTED: "not_submitted",
  PREPARING: "preparing",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXPIRED: "expired",
  WITHDRAWN: "withdrawn",
} as const;

export type CertificationStatus = typeof CERTIFICATION_STATUS[keyof typeof CERTIFICATION_STATUS];

export const GOVERNING_BODY = {
  USAP: "usap",
  UPA_A: "upa_a",
} as const;

export type GoverningBody = typeof GOVERNING_BODY[keyof typeof GOVERNING_BODY];

export const ROUND_STATUS = {
  DRAFT: "draft",
  RECRUITING: "recruiting",
  ACTIVE: "active",
  REVIEW: "review",
  CLOSED: "closed",
} as const;

export type RoundStatus = typeof ROUND_STATUS[keyof typeof ROUND_STATUS];

export const EVALUATION_TYPE = {
  FIRST_IMPRESSION: "first_impression",
  FOLLOW_UP: "follow_up",
} as const;

export type EvaluationType = typeof EVALUATION_TYPE[keyof typeof EVALUATION_TYPE];

export const COMPARISON_REFERENCE = {
  CURRENT_PADDLE: "current_paddle",
  CANDIDATE: "candidate",
  EXPECTATION: "expectation",
} as const;

export type ComparisonReference = typeof COMPARISON_REFERENCE[keyof typeof COMPARISON_REFERENCE];

export const EVALUATION_PREFERENCE = {
  PREFERRED: "preferred",
  NEUTRAL: "neutral",
  NOT_PREFERRED: "not_preferred",
  NOT_ENOUGH_EVIDENCE: "not_enough_evidence",
} as const;

export type EvaluationPreference = typeof EVALUATION_PREFERENCE[keyof typeof EVALUATION_PREFERENCE];

export const EVALUATION_CONFIDENCE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type EvaluationConfidence = typeof EVALUATION_CONFIDENCE[keyof typeof EVALUATION_CONFIDENCE];

export const EVALUATION_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UPDATED: "updated",
  // Decision 1: an owner has manually unlocked a submitted evaluation for correction. The
  // original submittedAt is preserved; reopenedAt records the unlock.
  REOPENED: "reopened",
} as const;

export type EvaluationStatus = typeof EVALUATION_STATUS[keyof typeof EVALUATION_STATUS];

// The audit's 1-5 score categories - all nullable/optional ("not every category mandatory").
export const EVALUATION_SCORE_FIELDS = [
  { key: "scoreControl", label: "Control" },
  { key: "scoreStability", label: "Stability" },
  { key: "scoreFeel", label: "Feel" },
  { key: "scoreComfort", label: "Comfort" },
  { key: "scoreConsistency", label: "Consistency" },
  { key: "scoreOverallPreference", label: "Overall Preference" },
  { key: "scorePower", label: "Power" },
  { key: "scoreSpin", label: "Spin" },
  { key: "scoreForgiveness", label: "Forgiveness" },
  { key: "scoreManeuverability", label: "Maneuverability" },
  { key: "scoreSound", label: "Sound" },
  { key: "scoreFatigue", label: "Fatigue" },
  { key: "scoreBuildQuality", label: "Build Quality" },
] as const;

export const ISSUE_CATEGORY = {
  SURFACE_WEAR: "surface_wear",
  CORE_CRUSH: "core_crush",
  DELAMINATION: "delamination",
  EDGE_GUARD: "edge_guard",
  HANDLE: "handle",
  SOUND: "sound",
  COSMETIC: "cosmetic",
  PACKAGING: "packaging",
  OTHER: "other",
} as const;

export type IssueCategory = typeof ISSUE_CATEGORY[keyof typeof ISSUE_CATEGORY];

export const ISSUE_TYPE = {
  COSMETIC: "cosmetic",
  FUNCTIONAL: "functional",
} as const;

export type IssueType = typeof ISSUE_TYPE[keyof typeof ISSUE_TYPE];

export const ISSUE_SEVERITY = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  STOP_USE: "stop_use",
} as const;

export type IssueSeverity = typeof ISSUE_SEVERITY[keyof typeof ISSUE_SEVERITY];

export const STILL_PLAYABLE = {
  YES: "yes",
  NO: "no",
  UNSURE: "unsure",
} as const;

export type StillPlayable = typeof STILL_PLAYABLE[keyof typeof STILL_PLAYABLE];

export const IMMEDIATE_ACTION = {
  CONTINUE: "continue",
  MONITOR: "monitor",
  BLOCK: "block",
  RETURN: "return",
  STOP_USE: "stop_use",
} as const;

export type ImmediateAction = typeof IMMEDIATE_ACTION[keyof typeof IMMEDIATE_ACTION];

export const ISSUE_RESOLUTION_STATUS = {
  OPEN: "open",
  MONITORING: "monitoring",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type IssueResolutionStatus = typeof ISSUE_RESOLUTION_STATUS[keyof typeof ISSUE_RESOLUTION_STATUS];

// Severity levels the audit flags as needing to visibly stand out (color + text, never color
// alone - UX-08/P2-06). Consumed by the IssueSeverityBadge component.
export const CRITICAL_ISSUE_SEVERITIES = new Set<string>([ISSUE_SEVERITY.HIGH, ISSUE_SEVERITY.STOP_USE]);

export const CLOSEOUT_SCOPE = {
  ROUND: "round",
  REVISION: "revision",
  PRODUCT: "product",
} as const;

export type CloseoutScope = typeof CLOSEOUT_SCOPE[keyof typeof CLOSEOUT_SCOPE];

export const CLOSEOUT_DECISION = {
  ADVANCE: "advance",
  MODIFY: "modify",
  REJECT: "reject",
  GATHER_MORE_EVIDENCE: "gather_more_evidence",
} as const;

export type CloseoutDecisionType = typeof CLOSEOUT_DECISION[keyof typeof CLOSEOUT_DECISION];

export const EVIDENCE_STRENGTH = {
  EARLY_SIGNAL: "early_signal",
  DIRECTIONAL_EVIDENCE: "directional_evidence",
  REPEATED_OBSERVATION: "repeated_observation",
  STRONG_INTERNAL_CONFIDENCE: "strong_internal_confidence",
} as const;

export type EvidenceStrength = typeof EVIDENCE_STRENGTH[keyof typeof EVIDENCE_STRENGTH];

// evidenceStrength values that make `limitations` mandatory on the closeout decision (audit:
// "Required when evidence is directional or incomplete").
export const LIMITATIONS_REQUIRED_EVIDENCE_STRENGTHS = new Set<string>([
  EVIDENCE_STRENGTH.EARLY_SIGNAL,
  EVIDENCE_STRENGTH.DIRECTIONAL_EVIDENCE,
]);

export const EVIDENCE_TYPE = {
  EVALUATION: "evaluation",
  ISSUE_REPORT: "issue_report",
  MEASUREMENT: "measurement",
  INSPECTION: "inspection",
} as const;

export type EvidenceType = typeof EVIDENCE_TYPE[keyof typeof EVIDENCE_TYPE];

// Application-level enum for waitlistSubscribers.signupSource (column stays text). 'other' is
// reserved for future non-web signup paths and is never triggered by either public form in
// Step 14 (documented here, not a bug if it never appears in real data yet).
export const SIGNUP_SOURCE = {
  LANDING_PAGE: "landing_page",
  TESTER_FORM: "tester_form",
  REFERRAL: "referral",
  OTHER: "other",
} as const;

export type SignupSource = typeof SIGNUP_SOURCE[keyof typeof SIGNUP_SOURCE];

export const CTA_SOURCE = {
  HERO: "hero",
  NAVIGATION: "navigation",
  FOOTER: "footer",
  UPDATE: "update",
} as const;

export type CtaSource = typeof CTA_SOURCE[keyof typeof CTA_SOURCE];

export const INTEREST_TYPE = {
  DEVELOPMENT_UPDATES: "development_updates",
  TESTER_OPPORTUNITIES: "tester_opportunities",
  EARLY_ACCESS: "early_access",
  ALL: "all",
} as const;

export type InterestType = typeof INTEREST_TYPE[keyof typeof INTEREST_TYPE];

export const WAITLIST_CONSENT_TEXT_VERSION = "v1.0";

// Handle length category boundaries (audit-exact): Short < 5.2in; Medium 5.2-5.4in; Long > 5.4in.
export function deriveHandleLengthCategory(handleLengthIn: number | null | undefined): "Short" | "Medium" | "Long" | null {
  if (handleLengthIn === null || handleLengthIn === undefined) return null;
  if (handleLengthIn < 5.2) return "Short";
  if (handleLengthIn <= 5.4) return "Medium";
  return "Long";
}

// Step 4 (Workstream D) — Product, Revision, Sample and Measurement Standards.

// Swing/twist weight "method" fields were previously free text; the brief requires a
// controlled selector. Columns stay text (matches this codebase's established
// text-column + app-level-enum pattern, see publishedState/relationshipStatus etc.) —
// only the allowed values are now constrained here plus in the zod schema.
export const MEASUREMENT_METHOD = {
  RDC_BABOLAT: "rdc_babolat",
  ONCOURT_SWINGWEIGHT: "oncourt_swingweight",
  MANUAL_PENDULUM: "manual_pendulum",
  TWISTWEIGHT_LAB: "twistweight_lab",
  OTHER: "other",
} as const;

export type MeasurementMethod = typeof MEASUREMENT_METHOD[keyof typeof MEASUREMENT_METHOD];

// Quick-select core thickness options (brief: "Quick options 13/14/16 plus Other numeric").
export const CORE_THICKNESS_QUICK_OPTIONS_MM = [13, 14, 16] as const;

// Brief's exact balance point definition wording — quoted verbatim, do not paraphrase.
export const BALANCE_POINT_DEFINITION =
  "centimeters from bottom of butt cap";

export const BALANCE_POINT_HELPER_TEXT =
  "Balance point is measured in centimeters from the bottom of the butt cap.";

// Plausible-range warning thresholds (brief's own concrete examples: "Static weight entered
// as 4 oz" should warn, "Length entered as 555 in" should block/require explicit override).
// oz is the primary display/input per the measurement standards table; g is derived.
export const PLAUSIBLE_RANGES = {
  staticWeightOz: { min: 5, max: 14, hardMax: 20 },
  overallLengthIn: { min: 14, max: 18, hardMax: 30 },
  overallWidthIn: { min: 6, max: 9, hardMax: 20 },
  handleLengthIn: { min: 3, max: 7, hardMax: 15 },
  gripCircumferenceIn: { min: 3.5, max: 5, hardMax: 10 },
} as const;

export const OZ_TO_G = 28.349523125;

export function ozToGrams(oz: number): number {
  return Math.round(oz * OZ_TO_G * 100) / 100;
}

export function gramsToOz(g: number): number {
  return Math.round((g / OZ_TO_G) * 100) / 100;
}
