import { describe, it, expect, vi } from "vitest";
import { createPendingTester } from "@/server/services/tester-service";
import { createAssignment, activateAssignment } from "@/server/services/assignment-service";
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
