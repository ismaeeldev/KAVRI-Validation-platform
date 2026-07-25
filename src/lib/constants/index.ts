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
