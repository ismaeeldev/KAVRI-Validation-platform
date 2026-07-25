# CONTRIBUTING.md — KAVRI Development Guidelines

Welcome to the KAVRI Validation Platform. To maintain code quality, security, and traceability, please follow these guidelines strictly.

## 1. Branching & Workflow

- `main`: Reserved for stable, production-ready, client-reviewable releases.
- `develop`: The integration branch for Sprint 1 work. All feature branches branch off and merge back into `develop`.
- `feature/<name>`: Dedicated branches for individual tasks or screens.

Before starting a task:
```powershell
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

## 2. Secrets & Security

- **NO SECRETS IN SOURCE CONTROL**: Never commit real passwords, connection strings, API tokens, session keys, or raw invitation tokens.
- **Environment Variables**: Add new keys to `.env.example` with names only. Place the real secrets in `.env.local` (local development) or configure them directly in Vercel settings (previews, staging, production).
- **Invitation Tokens**: Save only the hashed value of the tokens in the database. Never write raw tokens to console logs or log streams.

## 3. Database & Migrations

- All schema modifications must be done through Drizzle ORM schemas.
- Do not run manual SQL alter queries on the server database directly.
- Generate migrations using the package script:
  ```powershell
  pnpm db:generate
  ```
- Commit all generated migration SQL files under the `drizzle/` directory.
- Apply migrations to databases using:
  ```powershell
  pnpm db:migrate
  ```

## 4. Coding & Quality Standards

- **TypeScript**: Strict mode is enabled. Avoid `any` types. Provide explicit definitions for interfaces, function parameters, and return types.
- **Server Components by Default**: Use React Server Components (RSC) to handle data fetching. Use Client Components (`"use client"`) only for user interaction or UI animation.
- **Tailwind & Class Sorting**: Classes must be sorted using the Prettier plugin Tailwind CSS sorting configuration.
- **Error Handling**: Use the typed `AppError` class from `src/lib/errors` and return public-safe error codes. Never expose raw database exceptions or internal stack traces to clients.

## 5. Testing Requirements

All contributions must pass the verification checks:
```powershell
pnpm check
```
This script runs:
1. **ESLint**: `pnpm lint` (static code analysis)
2. **Type check**: `pnpm typecheck` (strict TypeScript validation)
3. **Unit Tests**: `pnpm test` (Vitest unit and component tests)
4. **Build**: `pnpm build` (Next.js compilation check)

E2E testing is run separately:
```powershell
pnpm test:e2e
```
All new interactive components and mutations should have matching unit tests and/or Playwright E2E coverage.
