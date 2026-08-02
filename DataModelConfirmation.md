# Data Model Confirmation — Sprint 1 Revision, Step 1

Prepared in response to `KAVRI_Validation_Platform_Developer_Audit_v1.0.docx` Section 3 ("Product Architecture and Core Data Relationships") and Section 17 ("Developer response requested"), and `sprint1_rev.md` Step 1.

Verified directly against `src/db/schema/domain.ts`, `src/db/schema/auth.ts`, and `src/server/services/public-queries-service.ts` on 2026-07-30, and against a live query of the production database (see `backups/pre-sprint1-rev-baseline-*.json`, 73 rows across 15 tables, taken immediately before this document was written).

## 1. Confirmed relationship chain (as implemented today)

```
Supplier → Product → Revision → Physical Sample → Assignment
```

This chain exists and is correctly bound via foreign keys (see Section 2 below). It matches the audit's required chain up through Assignment.

**The audit's full required chain is:**

```
Supplier → Product → Revision → Physical Sample → Test Round → Assignment
→ Play Session → Evaluation / Issue → Closeout Decision
```

**Confirmed gap:** `Test Round`, `Play Session`, `Evaluation`, `Issue Report`, and `Closeout Decision` do **not exist** anywhere in the current schema, services, actions, or UI. This was independently verified by exhaustive grep across `src/` (zero matches for `test.?round`, `evaluation`, `issue.?report`, `closeout`, `play.?session`) and is explicitly acknowledged in-product: the tester assignment detail page contains a literal placeholder string stating these features "will unlock during a future phase."

This answers the audit's D-08 question directly: **these modules do not already exist** — they are net-new P0 work, per `sprint1_rev.md` Steps 6–9.

## 2. Foreign keys and their behavior

| Table | Column | References | ON DELETE | Nature |
|---|---|---|---|---|
| `session` | `user_id` | `user.id` | cascade | Auth-managed |
| `account` | `user_id` | `user.id` | cascade | Auth-managed |
| `userProfiles` | `user_id` | `user.id` | cascade | 1:1 with auth user |
| `products` | `supplier_id` | `suppliers.id` | no action (default) | Point-in-time at creation; not re-validated on supplier archive |
| `products` | `created_by` | `user.id` | no action | Audit trail |
| `productRevisions` | `product_id` | `products.id` | no action | Structural |
| `productRevisions` | `created_by` | `user.id` | no action | Audit trail |
| `physicalSamples` | `product_id` | `products.id` | no action | Structural |
| `physicalSamples` | `revision_id` | `productRevisions.id` | no action | **Point-in-time reference — this is the audit's traceability anchor** |
| `physicalSamples` | `supplier_id` | `suppliers.id` | no action | Denormalized from revision at creation |
| `physicalSamples` | `status_changed_by` / `created_by` | `user.id` | no action | Audit trail |
| `testerProfiles` | `user_id` | `user.id` | set null | Tester can be deactivated without losing profile |
| `testerProfiles` | `approved_by` / `deactivated_by` | `user.id` | no action | Audit trail |
| `testerInvitations` | `tester_profile_id` | `testerProfiles.id` | cascade | Invitation tokens are disposable |
| `testerInvitations` | `created_by` | `user.id` | no action | Audit trail |
| `testingAssignments` | `tester_profile_id` | `testerProfiles.id` | no action | **Point-in-time reference** |
| `testingAssignments` | `product_id` / `revision_id` / `sample_id` | respective tables | no action | **Point-in-time references — this is the audit's core traceability requirement** |
| `testingAssignments` | `tester_user_id` / `activated_by` / `revoked_by` / `created_by` | `user.id` | no action | Audit trail |
| `publicUpdates` | `product_id` / `revision_id` | respective tables | no action (nullable) | Publication reference |
| `publicUpdates` | `created_by` / `updated_by` | `user.id` | no action | Audit trail |
| `activityLogs` | `actor_user_id` | `user.id` | set null | Log survives user deletion |

**No cascading deletes exist on any domain-data foreign key** (suppliers → products → revisions → samples → assignments). This is correct and intentional: it means the codebase cannot silently cascade-delete a supplier and wipe out its products/revisions/samples. Combined with every archive operation being a soft `status` update (never a SQL `DELETE`, confirmed in `supplier-service.ts`, `product-service.ts`, `sample-service.ts`), **archived records remain queryable and referenced records cannot be hard-deleted through the current service layer** — this satisfies the audit's "Deletion should be blocked once a record is referenced; use archive/deactivate instead" rule as currently implemented, with no code change required for that specific rule.

## 3. Immutability status

**Revisions are currently create-only** — no `updateRevision` function or edit route exists anywhere in the codebase (confirmed: `product-service.ts` has `createRevision` but no update function; no `/owner/products/[id]/revisions/[revId]/edit` route exists). This means **no historical-rewrite risk exists today** — a sample or assignment referencing a revision can never have that revision's specs change out from under it, simply because there is no way to change them at all yet.

**This will change in Step 3**, which adds `updateRevision` for the first time (required to let the owner fill in the many new spec fields the audit requires after a revision is created). Step 3's plan already specifies the required safeguard: once ≥1 physical sample references a revision, spec-defining fields become read-only in the edit form unless an explicit "Controlled Correction" action is used, which is separately logged via `activityLogs` with action `revision.corrected`. **This guard must ship in the same change that adds `updateRevision` — never add the update capability first and the guard later**, or there will be a window where historical rewrite is possible.

Products have the same shape (create + update, no immutability concern since the audit doesn't require product-level immutability — only revision and sample records).

## 4. Public query field allowlists (verified against live source, 2026-07-30)

All three public query functions in `src/server/services/public-queries-service.ts` return explicitly hand-mapped DTOs, never raw table rows:

- **`getPublicUpdatesFeed()`** → `{ id, title, summary, statusLabel, developmentStage, publishedAt, product: { publicAlias }, revision: { revisionCode } }`. Internally fetches full `product`/`revision` rows via a relational `with` query (which *does* include `internalName`, `internalNotes`, `descriptionInternal` at the driver level), but the return statement discards everything outside the mapped shape above before it reaches the caller. No leak.
- **`getPublicProducts()`** → `{ id, publicAlias, publicSummary, revisions: [{ id, revisionCode, publicTitle, publicSummary, developmentStage }] }`. Same pattern — internal fields fetched, never returned.
- **`getPublicMetrics()`** → aggregate `count()` values only (`revisionsCount`, `samplesReceived`, `approvedTesters`, `activeAssignments`, `publishedUpdates`). No row-level data at all.

**Confirmed: no internal-only field (`internalName`, `notes`, `contactEmail`, `internalNotes`, `descriptionInternal`, `createdBy`) is exposed by any public query as of this baseline.**

**Flag for Step 10:** `getPublicMetrics()` line 111 filters assignments by `eq(schema.testingAssignments.status, "active")`. Step 10 renames the stored `'active'` lifecycle value to `'invited'` to resolve a naming collision with a new computed display state. **This query must be updated in the same change**, or the public "active assignments" metric will silently start returning 0 once Step 10 ships. Noting this now so it isn't missed later.

## 5. Questions for KAVRI

1. **Sample "Assigned"/"Returned" status** (audit Section 8 sample status list): should this be a *stored* column value (as `sprint1_rev.md` Step 4/10 currently plan) or purely *derived* from the existence of an active assignment, as the audit's "Current Holder" field description ("Derived from assignments/returns") might imply for holder tracking specifically? We are proceeding with **stored status + a separate derived `getCurrentHolder()` function**, since the audit's own sample status table (Section 8) lists Assigned/Returned/Retired as first-class status values, not just a holder computation. Flag if this reading is wrong.
2. **`relationshipStatus` naming on Supplier** (audit's "Status" field, Active/Under Evaluation/Inactive/Rejected): we are implementing this as a new column distinct from the existing archive `status` flag, named `relationshipStatus` in code to avoid ambiguity. No client-facing UI label conflict is expected (the UI will show "Relationship Status" and "Archived" as two separate, clearly labeled fields), but flag if a different UI label is preferred.
3. **"Team Login" nav placement** (Step 15): the current live site has "Validation Portal" prominently in the main nav, not footer-only as the audit assumes. `sprint1_rev.md` plans to relocate it to footer-only per the audit, but this is a live, working navigation item today — proceeding on the assumption that the audit's explicit instruction (D-05, "Move public portal access to low-prominence Team Login in footer") is the final word, but this is called out again here per Step 1's own confirmation requirement.

## 6. Backup confirmation (M1)

A full data snapshot was taken immediately before this document was written and before any schema migration in this revision cycle: `backups/pre-sprint1-rev-baseline-2026-07-30T05-50-24-856Z.json` (73 rows across 15 tables). This file is gitignored (`/backups/` added to `.gitignore`) since it contains real user/tester data. It is stored locally only — if off-machine retention is desired, copy it to secure storage separately. Re-run `pnpm db:backup` at any point to produce a fresh snapshot.

## Sign-off

This document was produced under direct authorization from the project owner to proceed with implementation (M2 — client sign-off — is satisfied by that authorization; no separate external client review was required for this internal revision cycle). No application code was changed in this step.
