import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { auth } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { getAttachmentsAction } from "@/server/actions/attachment-actions";
import { db } from "@/db";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("Security & Auth Hardening Unit Tests (Sprint 1 revision, Step 16)", () => {
  describe("Session configuration", () => {
    it("reads explicit session expiration/refresh values from auth.ts, not framework defaults", () => {
      expect(auth.options.session?.expiresIn).toBe(60 * 60 * 24 * 7);
      expect(auth.options.session?.updateAge).toBe(60 * 60 * 24);
    });
  });

  describe("Forgot-password email", () => {
    const originalKey = process.env.RESEND_API_KEY;

    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
    });

    afterEach(() => {
      if (originalKey) process.env.RESEND_API_KEY = originalKey;
    });

    it("fails loudly instead of reporting false success when RESEND_API_KEY is absent", async () => {
      await expect(sendPasswordResetEmail("someone@example.com", "https://kavri.co/reset-password?token=abc")).rejects.toThrow(
        "Email service is not configured"
      );
    });
  });

  describe("Attachment access authorization (IDOR)", () => {
    it("rejects a tester listing attachments for a sample they have no assignment on", async () => {
      const sessionSpy = vi.spyOn(auth.api, "getSession").mockResolvedValue({
        user: { id: "tester_no_access" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const profileSpy = vi.spyOn(db.query.userProfiles, "findFirst").mockResolvedValue({
        userId: "tester_no_access",
        role: "tester",
        accountStatus: "active",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined);

      await expect(getAttachmentsAction("sample", "samp_not_mine")).rejects.toThrow();

      sessionSpy.mockRestore();
      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
    });

    it("allows an owner to list attachments for any sample", async () => {
      const sessionSpy = vi.spyOn(auth.api, "getSession").mockResolvedValue({
        user: { id: "owner_1" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const profileSpy = vi.spyOn(db.query.userProfiles, "findFirst").mockResolvedValue({
        userId: "owner_1",
        role: "owner",
        accountStatus: "active",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const attachmentsSpy = vi.spyOn(db.query.photoAttachments, "findMany").mockResolvedValue([]);

      await expect(getAttachmentsAction("sample", "any_sample")).resolves.toEqual([]);

      sessionSpy.mockRestore();
      profileSpy.mockRestore();
      attachmentsSpy.mockRestore();
    });
  });
});
