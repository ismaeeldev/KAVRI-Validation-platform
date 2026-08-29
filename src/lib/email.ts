import "server-only";
import { Resend } from "resend";

// Step 16 item 2: if RESEND_API_KEY is absent at runtime, this must fail loudly (thrown error
// surfaced to the caller) rather than silently doing nothing - a missing key must never produce
// a misleading "email sent" success message to the user. Provisioning RESEND_API_KEY itself is
// manual step M4 in sprint1_rev.md; this code path is complete and correct, but end-to-end
// delivery to a real inbox is unverified until that key is provisioned.
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured - password reset email to ${email} was NOT sent.`
    );
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Reset your KAVRI password",
    html: `
      <p>Someone requested a password reset for your KAVRI account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send password reset email to ${email}:`, error);
    throw new Error("Failed to send password reset email.");
  }
}

// Step 2A (FUNC-02 closure): sends the tester activation invitation email. Follows the exact
// same fail-loudly pattern as sendPasswordResetEmail above - a missing RESEND_API_KEY must never
// produce a misleading "invitation sent" success message to the owner. This function only ever
// fires when explicitly triggered by an owner's Send/Resend action - never automatically on
// tester record or invitation-token creation.
export async function sendInvitationEmail(
  email: string,
  testerName: string,
  inviteUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured - invitation email to ${email} was NOT sent.`
    );
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "You're invited to test with KAVRI.",
    html: `
      <p>Hi ${testerName},</p>
      <p>You've been invited to join KAVRI paddle testing.</p>
      <p><a href="${inviteUrl}">Tap here to accept your invitation and set up your account</a></p>
      <p>By accepting, you're committing to play with an assigned sample, log your sessions, and
      submit a First Impression and Follow-Up evaluation by the due date on each assignment.</p>
      <p>This link is one-time use and will expire, so please accept it soon.</p>
      <p>Questions or trouble accepting? Reply to this email and KAVRI will help.</p>
      <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send invitation email to ${email}:`, error);
    throw new Error("Failed to send invitation email.");
  }
}

// Step 3 (Workstream B, Notification Event Matrix row "Tester application"): confirms receipt
// to the applicant. Explicitly states selection is not guaranteed and explains the next step,
// per the matrix's "Expected result" column. Same fail-loudly pattern as the functions above -
// a missing RESEND_API_KEY must never look like a confirmation was actually sent.
export async function sendTesterApplicationConfirmationEmail(
  email: string,
  applicantName: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured - tester application confirmation to ${email} was NOT sent.`
    );
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "We received your KAVRI tester application",
    html: `
      <p>Hi ${applicantName},</p>
      <p>Thanks for applying to test with KAVRI. Your application has been received.</p>
      <p>Being selected as a tester is not guaranteed - we review applications against the needs of
      each upcoming test round. If you're a fit for an opening, we'll reach out by email with next
      steps. If you don't hear from us right away, it just means there isn't a matching round yet.</p>
      <p>No action is needed from you at this time.</p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send tester application confirmation to ${email}:`, error);
    throw new Error("Failed to send application confirmation email.");
  }
}

// Step 3 (Notification Event Matrix row "Assignment"): sent only from the owner's deliberate
// "Create and Send" / Invite action (activateAssignment) - never on assignment creation/draft
// alone. Includes round, blind/sample reference, due date, required sessions/forms and an
// acknowledgment link, per the matrix's "Required channel" and "Expected result" columns.
export async function sendAssignmentNotificationEmail(
  email: string,
  testerName: string,
  details: {
    roundCode: string;
    sampleCode: string;
    dueAt: Date;
    requiredSessionCount: number;
    acknowledgeUrl: string;
  }
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured - assignment notification to ${email} was NOT sent.`
    );
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";
  const dueDateLabel = details.dueAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "New KAVRI testing assignment",
    html: `
      <p>Hi ${testerName},</p>
      <p>You have a new testing assignment ready for you.</p>
      <ul>
        <li><strong>Round:</strong> ${details.roundCode}</li>
        <li><strong>Sample reference:</strong> ${details.sampleCode}</li>
        <li><strong>Due date:</strong> ${dueDateLabel}</li>
        <li><strong>Required sessions/forms:</strong> ${details.requiredSessionCount} play session(s), plus the First Impression and Follow-Up forms</li>
      </ul>
      <p><a href="${details.acknowledgeUrl}">Open your assignment and acknowledge it</a></p>
      <p>Please acknowledge the assignment so KAVRI knows you've received it.</p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send assignment notification to ${email}:`, error);
    throw new Error("Failed to send assignment notification email.");
  }
}

// Step 3 (Notification Event Matrix row "Reminder"): fired only from the owner's explicit
// "Log Reminder" click - deep-links back to the same assignment so the tester can pick up where
// they left off.
export async function sendReminderEmail(
  email: string,
  testerName: string,
  assignmentUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[email] RESEND_API_KEY is not configured - reminder email to ${email} was NOT sent.`);
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Reminder: your KAVRI testing assignment",
    html: `
      <p>Hi ${testerName},</p>
      <p>This is a reminder about your open KAVRI testing assignment.</p>
      <p><a href="${assignmentUrl}">Open your assignment</a></p>
      <p>If you've already completed it, thank you - you can ignore this reminder.</p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send reminder email to ${email}:`, error);
    throw new Error("Failed to send reminder email.");
  }
}

// Step 6 (Workstream E / Decision 3): tester magic-link sign-in email. Testers have no password -
// they request a one-time link and click it. Same fail-loudly pattern as every other function in
// this file: a missing RESEND_API_KEY must never let the tester login page claim "check your inbox"
// when nothing was actually sent.
export async function sendMagicLinkEmail(
  email: string,
  magicLinkUrl: string,
  expiresInMinutes: number
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured - magic link email to ${email} was NOT sent.`
    );
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: "Your KAVRI sign-in link",
    html: `
      <p>Here's your one-time sign-in link for KAVRI testing.</p>
      <p><a href="${magicLinkUrl}">Tap here to sign in</a></p>
      <p>This link works once and expires in ${expiresInMinutes} minutes. If it has expired, just
      request a new one from the tester sign-in page.</p>
      <p>If you didn't request this, you can safely ignore this email - no one can sign in without
      the link above.</p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send magic link email to ${email}:`, error);
    throw new Error("Failed to send sign-in link email.");
  }
}

// Step 3 (Notification Event Matrix row "Stop Use issue"): immediate, high-priority alert to the
// owner. Only fired when a tester (or owner) logs an issue with severity 'stop_use' - not for
// 'high' severity, which the dashboard already surfaces via CRITICAL_ISSUE_SEVERITIES on the
// samples page without an email.
export async function sendStopUseAlertEmail(
  email: string,
  details: {
    sampleCode: string;
    category: string;
    description: string;
    issueUrl: string;
  }
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[email] RESEND_API_KEY is not configured - stop use alert to ${email} was NOT sent.`
    );
    throw new Error("Email service is not configured on this deployment. Contact the developer.");
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "KAVRI <noreply@kavri.co>";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: `HIGH PRIORITY: Stop Use issue reported on ${details.sampleCode}`,
    html: `
      <p style="color:#b33a32;font-weight:bold;">A tester has reported a Stop Use issue. This needs review as soon as possible.</p>
      <ul>
        <li><strong>Sample reference:</strong> ${details.sampleCode}</li>
        <li><strong>Category:</strong> ${details.category}</li>
        <li><strong>Description:</strong> ${details.description}</li>
      </ul>
      <p><a href="${details.issueUrl}">Open this issue in the owner dashboard</a></p>
    `,
  });

  if (error) {
    console.error(`[email] Resend failed to send stop use alert to ${email}:`, error);
    throw new Error("Failed to send stop use alert email.");
  }
}
