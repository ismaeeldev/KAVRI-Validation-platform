# Security Hardening & Permissions Guide

This guide details the security foundation implemented to protect the KAVRI Validation Platform.

## 1. Access Roles Map
- **Public**: Accesses the landing page (`/`), waitlist forms, and invite acceptance token gates (`/invite/[token]`).
- **Tester**: Accesses mobile portal (`/tester`) only. Denied access to owner routes.
- **Owner**: Accesses administrative dashboard (`/owner`) only.

---

## 2. Server-Side Guard Helpers
The platform protects server-side operations via permission helpers (`src/lib/permissions.ts`):
- `requireOwner()`: Validates that the active session belongs to a user with the `owner` role. Throws 403 Forbidden on failure.
- `requireActiveTester()`: Validates that the active session belongs to a user with the `tester` role and that their profile status is `'approved'`. Deactivated profiles are denied.

---

## 3. IDOR Protections
To prevent IDOR (Insecure Direct Object Reference) tampering:
- All tester portal list queries filter by the current logged-in user profile ID.
- Tester portal detail views query using BOTH the `assignmentId` AND the current `testerProfileId` in the same database query. Testers can never read metadata of assignments belonging to other testers.

---

## 4. Cryptographic Hashed Tokens
- Plaintext invitation tokens are hashed using SHA-256 (`invitation-service.ts`) before database insertions.
- Plaintext tokens are displayed exactly once in the owner's UI dialog modal and are never recorded in database fields or system logs.
- Replaying used or expired tokens is blocked.
