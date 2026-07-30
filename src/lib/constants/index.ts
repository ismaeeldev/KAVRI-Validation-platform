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

export const ASSIGNMENT_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  ACKNOWLEDGED: "acknowledged",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;

export type AssignmentStatus = typeof ASSIGNMENT_STATUS[keyof typeof ASSIGNMENT_STATUS];

export const PUBLIC_UPDATE_STATE = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export type PublicUpdateState = typeof PUBLIC_UPDATE_STATE[keyof typeof PUBLIC_UPDATE_STATE];

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

// Handle length category boundaries (audit-exact): Short < 5.2in; Medium 5.2-5.4in; Long > 5.4in.
export function deriveHandleLengthCategory(handleLengthIn: number | null | undefined): "Short" | "Medium" | "Long" | null {
  if (handleLengthIn === null || handleLengthIn === undefined) return null;
  if (handleLengthIn < 5.2) return "Short";
  if (handleLengthIn <= 5.4) return "Medium";
  return "Long";
}
