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
