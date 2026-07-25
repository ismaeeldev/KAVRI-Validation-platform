# Known Issues & Scope Boundaries

This document details known limitations and scope boundaries for KAVRI Validation Platform (Sprint 1).

## 1. Local Sandboxed Database Connection Timeout
- **Issue**: Execution sandboxes block outbound TCP websocket connection channels.
- **Impact**: Running E2E Playwright test suites locally yields Neon connection timeouts.
- **Resolution**: Rely on Vitest unit test suites (which mock database layers successfully) for local validation. Staging E2E tests run successfully once deployed on live Vercel/Neon staging servers where outbound database ports are open.

---

## 2. Sprint 1 Scope Exclusions (Deferred to Sprint 2)
The following features are out-of-scope for Sprint 1 and should not be represented as active in the user interfaces:
- **Tester Telemetry Logs**: Detailed session timers, wear-testing logs, on-court performance metrics.
- **Issue Tracking**: Submitting defect reports, logging photos, uploading court telemetry.
- **Final Evaluation & Decision**: Owner approval/rejection decision boards for paddle launches.
- **Marketing Emails**: Storing waitlist subscribers is supported, but waitlist marketing emails campaigns are out-of-scope.
