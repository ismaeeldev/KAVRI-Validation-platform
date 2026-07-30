import * as zod from "zod";
import { DEVELOPMENT_STAGE, SUPPLIER_TYPE, SUPPLIER_RELATIONSHIP_STATUS } from "../constants";

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
});

export const updateProductSchema = createProductSchema;

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
});

export const createSampleSchema = zod.object({
  sampleCode: zod.string().trim().toUpperCase().min(1, "Sample code is required").regex(/^[A-Z0-9_-]+$/, "Sample code must be alphanumeric uppercase, dash, or underscore"),
  supplierId: zod.string().min(1, "Supplier is required"),
  productId: zod.string().min(1, "Product is required"),
  revisionId: zod.string().min(1, "Revision is required"),
  receivedAt: zod.string().min(1, "Received date is required"),
  receivingObservations: zod.string().trim().min(1, "Receiving observations are required"),
  identifyingNotes: zod.string().trim().optional().or(zod.literal("")),
});

export const transitionStatusSchema = zod.object({
  status: zod.string().min(1, "Status is required"),
  readinessNote: zod.string().trim().min(1, "Readiness / transition note is required"),
});

export const createTesterSchema = zod.object({
  name: zod.string().trim().min(1, "Tester name is required"),
  email: zod.string().trim().toLowerCase().email("Invalid email address"),
});

export const acceptInvitationSchema = zod.object({
  password: zod.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: zod.string().min(8, "Confirmation password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createAssignmentSchema = zod.object({
  testerProfileId: zod.string().min(1, "Tester profile is required"),
  sampleId: zod.string().min(1, "Physical sample is required"),
  instructions: zod.string().trim().min(1, "Instructions are required"),
  dueAt: zod.string().min(1, "Due date is required"),
  requiredSessionCount: zod.number().int().min(1, "Required session count must be at least 1"),
});

export const revokeAssignmentSchema = zod.object({
  reason: zod.string().trim().min(1, "Revocation reason is required"),
});

export const createPublicUpdateSchema = zod.object({
  title: zod.string().trim().min(1, "Title is required"),
  summary: zod.string().trim().min(1, "Summary is required"),
  statusLabel: zod.string().trim().min(1, "Status label is required"),
  developmentStage: zod.nativeEnum(DEVELOPMENT_STAGE).optional().or(zod.literal("")),
  productId: zod.string().optional().or(zod.literal("")),
  revisionId: zod.string().optional().or(zod.literal("")),
  publishedState: zod.enum(["draft", "published", "archived"]),
  sortOrder: zod.number().int().default(0),
});

export const waitlistSignupSchema = zod.object({
  email: zod.string().trim().toLowerCase().email("Invalid email address"),
  honeypot: zod.string().optional(),
});

