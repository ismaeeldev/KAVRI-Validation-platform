import { describe, it, expect, vi } from "vitest";
import {
  getAssignmentComputedStatus,
  isAssignmentOverdue,
  checkAssignmentConflicts,
  activateAssignment,
  expireAssignment,
} from "@/server/services/assignment-service";
import { getCurrentHolder } from "@/server/services/sample-service";
import { ASSIGNMENT_STATUS } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await callback(db as any);
});

describe("Assignment Workflow Integration Unit Tests (Sprint 1 revision, Step 10)", () => {
  describe("Stored Status Rename (active -> invited)", () => {
    it("no longer exposes ACTIVE in ASSIGNMENT_STATUS; INVITED replaces it", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((ASSIGNMENT_STATUS as any).ACTIVE).toBeUndefined();
      expect(ASSIGNMENT_STATUS.INVITED).toBe("invited");
    });
  });

  describe("Computed Assignment Progress Status", () => {
    const base = {
      status: "acknowledged",
      requiredSessionCount: 2,
      sessionCount: 0,
      firstImpressionSubmitted: false,
      followUpSubmitted: false,
      sampleStatus: "assigned",
    };

    it("shows stored value as-is for draft/invited/revoked/expired (computed layer does not apply)", () => {
      for (const status of ["draft", "invited", "revoked", "expired"]) {
        expect(getAssignmentComputedStatus({ ...base, status }).label).toBe(status);
      }
    });

    it("transitions First Impression Due -> Active -> Follow-Up Due -> Complete as evidence accumulates", () => {
      expect(getAssignmentComputedStatus(base).label).toBe("first_impression_due");

      expect(
        getAssignmentComputedStatus({ ...base, firstImpressionSubmitted: true, sessionCount: 1 }).label
      ).toBe("active");

      expect(
        getAssignmentComputedStatus({
          ...base,
          firstImpressionSubmitted: true,
          sessionCount: 2,
        }).label
      ).toBe("follow_up_due");

      expect(
        getAssignmentComputedStatus({
          ...base,
          firstImpressionSubmitted: true,
          sessionCount: 2,
          followUpSubmitted: true,
          sampleStatus: "returned",
        }).label
      ).toBe("complete");
    });

    it("does NOT reach Complete when both evaluations are done but the sample hasn't been returned/retired", () => {
      const result = getAssignmentComputedStatus({
        ...base,
        firstImpressionSubmitted: true,
        sessionCount: 2,
        followUpSubmitted: true,
        sampleStatus: "assigned", // disposition not yet recorded
      });
      expect(result.label).toBe("follow_up_due");
      expect(result.subLabel).toBe("awaiting_sample_return");
    });
  });

  describe("Overdue (computed, displayed alongside lifecycle status)", () => {
    it("flags overdue for a past-due, non-terminal, non-complete assignment", () => {
      const overdue = isAssignmentOverdue({
        dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: "acknowledged",
        computedLabel: "follow_up_due",
      });
      expect(overdue).toBe(true);
    });

    it("does not flag overdue once complete, revoked, or expired even if past due", () => {
      const dueAt = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isAssignmentOverdue({ dueAt, status: "acknowledged", computedLabel: "complete" })).toBe(false);
      expect(isAssignmentOverdue({ dueAt, status: "revoked", computedLabel: "revoked" })).toBe(false);
      expect(isAssignmentOverdue({ dueAt, status: "expired", computedLabel: "expired" })).toBe(false);
    });
  });

  describe("Sample Disposition Wiring", () => {
    it("returns the tester's display name as current holder while a sample is 'assigned'", async () => {
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "sample_1",
        status: "assigned",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_1",
        testerProfile: { displayName: "Jane Tester" },
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      const holder = await getCurrentHolder("sample_1");
      expect(holder).toBe("Jane Tester");

      sampleSpy.mockRestore();
      assignmentSpy.mockRestore();
    });

    it("returns 'KAVRI' for every non-assigned sample status", async () => {
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "sample_1",
        status: "returned",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      const holder = await getCurrentHolder("sample_1");
      expect(holder).toBe("KAVRI");

      sampleSpy.mockRestore();
    });

    it("transitions the sample to 'assigned' when an assignment is invited", async () => {
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_1",
        status: "draft",
        sampleId: "sample_1",
        testerProfileId: "tester_1",
        round: { id: "round_1", roundCode: "R-1" },
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);
      const testerSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue({
        id: "tester_1",
        approvalStatus: "approved",
        userId: "user_tester_1",
      } as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>);
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "sample_1",
        sampleCode: "S-1",
        status: "ready_for_testing",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      const updateCalls: Record<string, unknown>[] = [];
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: (v: Record<string, unknown>) => {
          updateCalls.push(v);
          return {
            where: () => ({
              returning: () =>
                Promise.resolve([
                  "status" in v && v.status === "invited"
                    ? { id: "asg_1", sampleId: "sample_1", status: "invited" }
                    : { id: "sample_1", status: "assigned" },
                ]),
            }),
          };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await activateAssignment("asg_1", "user_owner");

      expect(result.status).toBe("invited");
      // Two updates: the assignment (status='invited') and the sample (status='assigned').
      expect(updateCalls.some((c) => c.status === "invited")).toBe(true);
      expect(updateCalls.some((c) => c.status === "assigned")).toBe(true);

      assignmentSpy.mockRestore();
      testerSpy.mockRestore();
      sampleSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe("Conflict Detection (warn, not block)", () => {
    it("warns when the sample already has a non-terminal assignment", async () => {
      const sampleConflictSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_existing",
        sampleId: "sample_1",
        status: "invited",
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        startAt: null,
        endAt: null,
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      const warnings = await checkAssignmentConflicts("tester_1", "sample_1", "round_1");
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toMatch(/non-terminal assignment/);

      sampleConflictSpy.mockRestore();
      roundSpy.mockRestore();
    });

    it("warns when the tester has an overlapping assignment in another round with overlapping dates", async () => {
      const sampleConflictSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined);
      const newRoundStart = new Date("2026-08-01");
      const newRoundEnd = new Date("2026-08-15");
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_new",
        startAt: newRoundStart,
        endAt: newRoundEnd,
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);
      const testerAssignmentsSpy = vi.spyOn(db.query.testingAssignments, "findMany").mockResolvedValue([
        {
          id: "asg_overlap",
          status: "acknowledged",
          round: { roundCode: "R-OVERLAP", startAt: new Date("2026-08-05"), endAt: new Date("2026-08-20") },
        },
      ] as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findMany>>);

      const warnings = await checkAssignmentConflicts("tester_1", "sample_1", "round_new");
      expect(warnings.some((w) => w.includes("R-OVERLAP"))).toBe(true);

      sampleConflictSpy.mockRestore();
      roundSpy.mockRestore();
      testerAssignmentsSpy.mockRestore();
    });

    it("returns no warnings when there is no sample conflict and no date overlap", async () => {
      const sampleConflictSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined);
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_new",
        startAt: null,
        endAt: null,
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      const warnings = await checkAssignmentConflicts("tester_1", "sample_1", "round_new");
      expect(warnings).toHaveLength(0);

      sampleConflictSpy.mockRestore();
      roundSpy.mockRestore();
    });
  });

  describe("Mark Expired", () => {
    it("transitions a draft/invited assignment to 'expired' (a real state change, not a UI no-op)", async () => {
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_1",
        status: "invited",
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "asg_1", status: "expired" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await expireAssignment("asg_1", "user_owner");
      expect(result.status).toBe("expired");

      assignmentSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("is blocked once an assignment is acknowledged or already complete/terminal", async () => {
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "asg_1",
        status: "acknowledged",
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      await expect(expireAssignment("asg_1", "user_owner")).rejects.toThrow(AppError);
      await expect(expireAssignment("asg_1", "user_owner")).rejects.toThrow("cannot be marked expired");

      assignmentSpy.mockRestore();
    });
  });
});
