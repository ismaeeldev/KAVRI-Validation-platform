# Deployment Handoff Guide

This document outlines the staging deployment pipeline for the KAVRI Validation Platform.

## Client Infrastructure Ownership

> [!IMPORTANT]
> The target deployment environments must be created and owned by **client-owned accounts** (not developer personal accounts).

1. **Vercel**:
   - Set up a Vercel project connected to the client-owned GitHub repository.
   - Detect the framework as **Next.js**.
2. **Neon Postgres**:
   - Deploy a staging branch on a client-owned Neon project.
   - Obtain the SSL-secured connection string (`DATABASE_URL`).

---

## Required Staging Environment Variables

Add these variables in the Vercel Project settings under Environment Variables:

| Variable Name | Description | Target Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Secure Neon staging connection string | `postgresql://...` |
| `BETTER_AUTH_SECRET` | 32-byte hexadecimal random encryption secret | `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Staging Vercel deployment root domain | `https://your-project.vercel.app` |
| `BOOTSTRAP_OWNER_EMAIL` | Owner admin account email | `admin@kavri.co` |
| `BOOTSTRAP_OWNER_NAME` | Owner user display name | `System Administrator` |
| `BOOTSTRAP_OWNER_TEMP_PASSWORD` | Temporary bootstrap credentials | `Kavri-SecureAdmin-2026!#` |

---

## Post-Deploy Actions

1. **Apply Migrations**:
   The Vercel deployment will automatically apply migrations during initial build cycles. You can also run:
   ```bash
   pnpm db:push
   ```
2. **Owner Rotation**:
   Log in to the staging portal using the bootstrapped credentials (`admin@kavri.co` / `Kavri-SecureAdmin-2026!#`). Once successfully signed in, navigate to `Account Settings` and change your password to rotate the temporary credentials.
3. **Verify Public Route**:
   Access the root URL to verify the "testing in the open" page is visible and shows honest empty metrics or draft updates filters correctly.
