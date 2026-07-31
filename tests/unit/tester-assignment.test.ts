import { describe, it, expect, vi } from "vitest";
import { createPendingTester, updateTesterApproval, declineTester } from "@/server/services/tester-service";
import { createAssignment, activateAssignment } from "@/server/services/assignment-service";
import { consumeInvitation } from "@/server/services/invitation-service";
import { acceptInvitationSchema } from "@/lib/validation/schemas";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

// Mock db.transaction to run the callback directly
vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await callback(db as any);
});

describe("Tester Management & Assignment Constraints Unit Tests", () => {
  describe("Tester Profile Constraints", () => {
    it("refuses duplicate email registration", async () => {
      // Mock existing tester profile email
      const spy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_1",
        emailNormalized: "duplicate@kavri.co",
        displayName: "First Tester",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      await expect(
        createPendingTester(
          {
            name: "Second Tester",
            email: "duplicate@kavri.co",
          },
          "user_owner"
        )
      ).rejects.toThrow("already exists");

      spy.mockRestore();
    });

    it("succeeds creating a tester with only name/email - all profile fields remain optional", async () => {
      const spy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(undefined);
      const insertSpy = vi.spyOn(db, "insert").mockReturnValue({
        values: (v: Record<string, unknown>) => ({
          returning: () => Promise.resolve([{ id: "tester_new", ...v }]),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await createPendingTester({ name: "Minimal Tester", email: "minimal@kavri.co" }, "user_owner");
      expect(result.displayName).toBe("Minimal Tester");

      spy.mockRestore();
      insertSpy.mockRestore();
    });
  });

  describe("Tester Approval, Decline & Consent (Sprint 1 revision, Step 5)", () => {
    it("rejects invitation acceptance when consent is not given", () => {
      const result = acceptInvitationSchema.safeParse({
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
        consentGiven: false,
        consentTextVersion: "v1.0",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const consentIssue = result.error.issues.find((i) => i.path[0] === "consentGiven");
        expect(consentIssue).toBeDefined();
      }
    });

    it("records consentAt/consentTextVersion when accepting an invitation with consent given", async () => {
      const invitationSpy = vi.spyOn(db.query.testerInvitations, "findFirst").mockResolvedValue({
        id: "invite_1",
        testerProfileId: "tester_1",
        usedAt: null,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as unknown as Awaited<ReturnType<typeof db.query.testerInvitations.findFirst>>);
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_1",
        emailNormalized: "consent@kavri.co",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      const authSpy = vi.spyOn((await import("@/lib/auth")).auth.api, "signUpEmail").mockResolvedValue({
        user: { id: "user_new" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const setCalls: Record<string, unknown>[] = [];
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: (v: Record<string, unknown>) => {
          setCalls.push(v);
          return { where: () => Promise.resolve() };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const insertSpy = vi.spyOn(db, "insert").mockReturnValue({
        values: () => Promise.resolve(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      await consumeInvitation("raw-token", "SecurePass123!", "Consented Tester", "v1.0");

      const profileUpdate = setCalls.find((c) => "consentAt" in c);
      expect(profileUpdate).toBeDefined();
      expect(profileUpdate?.consentTextVersion).toBe("v1.0");

      invitationSpy.mockRestore();
      testerSpy.mockRestore();
      authSpy.mockRestore();
      updateSpy.mockRestore();
      insertSpy.mockRestore();
    });

    it("only allows Decline while approvalStatus is 'pending', and requires a reason", async () => {
      const approvedSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_approved",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);
      await expect(declineTester("tester_approved", "Changed mind", "user_owner")).rejects.toThrow(AppError);
      await expect(declineTester("tester_approved", "Changed mind", "user_owner")).rejects.toThrow("pending");
      approvedSpy.mockRestore();

      const pendingSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_pending",
        approvalStatus: "pending",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "tester_pending", approvalStatus: "declined" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const result = await declineTester("tester_pending", "Not a good fit for this round", "user_owner");
      expect(result.approvalStatus).toBe("declined");
      pendingSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("only allows Deactivate once a tester is 'approved' (rejects for pending/declined)", async () => {
      const pendingSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_pending",
        approvalStatus: "pending",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);
      await expect(updateTesterApproval("tester_pending", "deactivated", "user_owner")).rejects.toThrow(
        "Only an approved tester"
      );
      pendingSpy.mockRestore();

      const approvedSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_approved",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "tester_approved", approvalStatus: "deactivated" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const result = await updateTesterApproval("tester_approved", "deactivated", "user_owner");
      expect(result.approvalStatus).toBe("deactivated");
      approvedSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe("Assignment Creation & Verification", () => {
    it("throws error if tester is not approved", async () => {
      // Mock tester profile as pending (not approved)
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_pending",
        approvalStatus: "pending",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      await expect(
        createAssignment(
          {
            roundId: "round_1",
            testerProfileId: "tester_pending",
            sampleId: "sample_1",
            instructions: "Perform wear test.",
            dueAt: "2026-07-30",
            requiredSessionCount: 2,
          },
          "user_owner"
        )
      ).rejects.toThrow("approved testers");

      testerSpy.mockRestore();
    });

    it("throws error if sample is not ready_for_testing", async () => {
      // Mock tester approved
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_approved",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      // Mock sample status as received (not ready_for_testing)
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "sample_not_ready",
        status: "received",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      await expect(
        createAssignment(
          {
            roundId: "round_1",
            testerProfileId: "tester_approved",
            sampleId: "sample_not_ready",
            instructions: "Perform wear test.",
            dueAt: "2026-07-30",
            requiredSessionCount: 2,
          },
          "user_owner"
        )
      ).rejects.toThrow("ready_for_testing");

      testerSpy.mockRestore();
      sampleSpy.mockRestore();
    });

    it("throws error on assignment activation if invite is not accepted (tester userId is null)", async () => {
      // Mock assignment fetch
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_1",
        testerProfileId: "tester_approved",
        sampleId: "sample_ready",
        status: "draft",
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      // Mock tester approved but NO linked userId (invite not accepted yet)
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_approved",
        approvalStatus: "approved",
        userId: null,
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      await expect(
        activateAssignment("asg_1", "user_owner")
      ).rejects.toThrow("fully onboarded");

      assignmentSpy.mockRestore();
      testerSpy.mockRestore();
    });
  });
});
