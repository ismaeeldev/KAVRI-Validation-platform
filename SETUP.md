# Developer Setup Guide

Follow this guide to spin up the KAVRI Validation Platform locally in a developer workspace.

## Pre-requisites

- **Node.js**: v18+ or v20+
- **pnpm**: v9+
- **Neon Postgres Database**: Staging/development project branch connection string.

## Local Configuration

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and populate:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-host.region.neon.tech/neondb?sslmode=require"
   BETTER_AUTH_SECRET="your-generated-strong-32-byte-hex"
   BETTER_AUTH_URL="http://localhost:3000"
   BOOTSTRAP_OWNER_EMAIL="admin@kavri.co"
   BOOTSTRAP_OWNER_NAME="System Administrator"
   BOOTSTRAP_OWNER_TEMP_PASSWORD="Kavri-SecureAdmin-2026!#"
   ```

3. **Apply Database Migrations**:
   ```bash
   pnpm db:push
   ```

4. **Bootstrap Owner Credentials**:
   Start the Next.js development server to trigger database schema initializations and automatic owner bootstrapping (checks `BOOTSTRAP_OWNER_EMAIL` and inserts the user record with the `owner` role):
   ```bash
   pnpm dev
   ```

5. **Run Verification Checks**:
   Confirm lint, typecheck, and unit test suites:
   ```bash
   pnpm check
   ```
