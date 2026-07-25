# Database & Drizzle Schema Guide

This document describes the data layer architecture of the KAVRI Validation Platform.

## Relational Models Map

The Drizzle ORM model schemas are defined across:
- **`src/db/schema/auth.ts`**: Better Auth user accounts, sessions, accounts, and verifications.
- **`src/db/schema/domain.ts`**: Core domain logic tracking:
  - `suppliers`: Manufacturing supplier parameters.
  - `products`: Product spec files containing internal names and public aliases.
  - `productRevisions`: Versioned specifications linking to DEVELOPMENT_STAGES.
  - `physicalSamples`: Logged batch codes, received observations, and triage readystate.
  - `testerProfiles`: Onboarded tester records linking user accounts, approval status, and timestamps.
  - `testerInvitations`: Cryptographic hashed tokens for access invitations.
  - `testingAssignments`: ValidationBrief tasks detailing instructions, due dates, and status.
  - `publicUpdates`: Safe timeline log updates published on the landing page log.
  - `waitlistSubscribers`: Email subscriber consent records.
  - `activityLogs`: Append-only audit logs.

---

## Migration Operations

Drizzle Kit manages schema syncs.

1. **Generate migrations after changes**:
   ```bash
   pnpm db:generate
   ```
2. **Apply migrations to staging Neon branch**:
   ```bash
   pnpm db:migrate
   ```
3. **Database Studio**:
   Use Drizzle Studio to inspect records locally:
   ```bash
   pnpm db:studio
   ```

---

## Data Integrity Constraints
- **Uniqueness**:
  - `suppliers.code` is unique.
  - `productRevisions` enforces composite unique keys on `productId` and `revisionCode` to prevent version duplicates.
  - `physicalSamples.sampleCode` must be unique.
  - `waitlistSubscribers.emailNormalized` must be unique.
- **Foreign Keys**:
  - Cascade deletion is restricted (`onDelete: "no action"` or set null) to preserve absolute traceability history on physical samples.
