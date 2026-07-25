# Owner Walkthrough Guide

Use this guide to navigate the Owner Administrative Workspace.

## 1. Traceability Setup Flow
1. **Onboard Supplier**:
   - Go to `Suppliers` &rarr; Click `+ Add Supplier`.
   - Provide name, code, contact, and internal notes.
2. **Register Product**:
   - Go to `Products` &rarr; Click `+ Add Product`.
   - Link to a supplier and supply internal specifications and a public alias.
3. **Log Revision**:
   - Go to the Product detail view &rarr; Click `+ New Revision`.
   - Log changes, reasons, requested updates, and set the public publication flag.

## 2. Physical Sample Logging & Triage
1. **Log Sample**:
   - Go to `Samples` &rarr; Click `+ Log Physical Sample`.
   - Provide a unique sample code and bind to the correct supplier, product, and revision.
2. **Triage Reviews**:
   - Go to the Sample detail view &rarr; Click `Begin Review` (sets status to `under_review`).
   - Transition states to `ready_for_testing`, `blocked`, or `rejected`. Add notes at each state change.

## 3. Tester Management & Assignments
1. **Register Tester**:
   - Go to `Testers` &rarr; Input Name and Email in the registration form.
2. **Approve & Invite**:
   - Go to the Tester profile view &rarr; Click `Approve Tester`.
   - Click `Generate Invitation`. Copy the one-time secure link displayed in the warning dialog and share it with the tester.
3. **Dispatch Assignment**:
   - Go to `Assignments` &rarr; Click `+ Create Assignment`.
   - Link an approved tester and a sample marked `ready_for_testing`. Write validation instructions and set a due date.
   - Activate the assignment brief once the tester has activated their account.
