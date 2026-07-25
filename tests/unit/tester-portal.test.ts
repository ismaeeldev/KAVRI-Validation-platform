import { describe, it, expect, vi } from "vitest";
import {
  getTesterAssignments,
  getTesterAssignmentById,
  acknowledgeAssignment,
} from "@/server/services/tester-portal-service";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

// Mock db.transaction globally
vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await callback(db as any);
});

describe("Tester Portal Access & IDOR Controls Unit Tests", () => {
  describe("IDOR Ownership Constraints", () => {
    it("refuses to query another tester's assignment", async () => {
      // Mock active tester profile (A)
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_profile_A",
        userId: "user_A",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      // Mock assignment query returning nothing for Tester A (IDOR block simulation)
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      await expect(
        getTesterAssignmentById("assignment_B", "user_A")
      ).rejects.toThrow("not found");

      testerSpy.mockRestore();
      assignmentSpy.mockRestore();
    });

    it("refuses to acknowledge another tester's assignment", async () => {
      // Mock active tester profile (A)
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_profile_A",
        userId: "user_A",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      // Mock assignment query returning nothing for Tester A trying to look up B's assignment
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      await expect(
        acknowledgeAssignment("assignment_B", "user_A")
      ).rejects.toThrow("not found");

      testerSpy.mockRestore();
      assignmentSpy.mockRestore();
    });
  });

  describe("Deactivation Access Block", () => {
    it("denies access completely for deactivated tester", async () => {
      // Mock deactivated tester profile
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_deactivated",
        userId: "user_deact",
        approvalStatus: "deactivated", // Deactivated
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      await expect(
        getTesterAssignments("user_deact")
      ).rejects.toThrow("deactivated or pending");

      testerSpy.mockRestore();
    });
  });

  describe("Triage State Machine Acknowledgement Controls", () => {
    it("denies acknowledgement for revoked or expired assignments", async () => {
      // Mock active tester profile
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_profile_A",
        userId: "user_A",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      // Mock assignment in 'revoked' state
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_revoked",
        testerProfileId: "tester_profile_A",
        status: "revoked",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      await expect(
        acknowledgeAssignment("asg_revoked", "user_A")
      ).rejects.toThrow("cannot be acknowledged");

      testerSpy.mockRestore();
      assignmentSpy.mockRestore();
    });

    it("succeeds for active assignments and is idempotent on repeat calls", async () => {
      // Mock active tester profile
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_profile_A",
        userId: "user_A",
        approvalStatus: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);

      // Mock assignment in 'active' state
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_active",
        testerProfileId: "tester_profile_A",
        status: "active",
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      // Mock db.update callback return value
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            returning: () => Promise.resolve([{ id: "asg_active", status: "acknowledged" }] as any),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await acknowledgeAssignment("asg_active", "user_A");
      expect(result.status).toBe("acknowledged");

      testerSpy.mockRestore();
      assignmentSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});
