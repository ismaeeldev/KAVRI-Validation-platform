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
  DEACTIVATED: "deactivated",
} as const;

export type TesterApproval = typeof TESTER_APPROVAL[keyof typeof TESTER_APPROVAL];

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
} as const;

export type SampleStatus = typeof SAMPLE_STATUS[keyof typeof SAMPLE_STATUS];

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

// Handle length category boundaries (audit-exact): Short < 5.2in; Medium 5.2-5.4in; Long > 5.4in.
export function deriveHandleLengthCategory(handleLengthIn: number | null | undefined): "Short" | "Medium" | "Long" | null {
  if (handleLengthIn === null || handleLengthIn === undefined) return null;
  if (handleLengthIn < 5.2) return "Short";
  if (handleLengthIn <= 5.4) return "Medium";
  return "Long";
}
