import { describe, it, expect, vi } from "vitest";
import { createRound, transitionRoundStatus } from "@/server/services/test-round-service";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

// Mock db.transaction to run the callback directly against db itself, matching the pattern
// already proven correct in tests/unit/tester-assignment.test.ts.
vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await callback(db as any);
});

describe("Test Rounds Module Unit Tests (Sprint 1 revision, Step 6)", () => {
  describe("Round Code Uniqueness", () => {
    it("refuses to create a round with a duplicate round code", async () => {
      const spy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        roundCode: "R1",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(
        createRound(
          {
            roundName: "Duplicate Round",
            roundCode: "R1",
            purpose: "Test duplicate code rejection.",
            instructions: "Do the thing.",
            requiredSessionCount: 2,
            requiredFormFirstImpression: true,
            requiredFormFollowUp: true,
            requiredFormIssueReport: false,
          },
          "user_owner"
        )
      ).rejects.toThrow("already allocated");

      spy.mockRestore();
    });
  });

  describe("Round Status State Machine", () => {
    it("allows draft->recruiting->active->review in sequence", async () => {
      const statuses = ["draft", "recruiting", "active", "review"];
      for (let i = 0; i < statuses.length - 1; i++) {
        const from = statuses[i];
        const to = statuses[i + 1];
        const findSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
          id: "round_1",
          status: from,
          closeoutDecisionId: null,
        } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);
        const updateSpy = vi.spyOn(db, "update").mockReturnValue({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([{ id: "round_1", status: to }]),
            }),
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const result = await transitionRoundStatus("round_1", to, "user_owner");
        expect(result.status).toBe(to);

        findSpy.mockRestore();
        updateSpy.mockRestore();
      }
    });

    it("rejects an invalid transition (e.g. draft directly to active)", async () => {
      const spy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "draft",
        closeoutDecisionId: null,
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(transitionRoundStatus("round_1", "active", "user_owner")).rejects.toThrow(AppError);
      await expect(transitionRoundStatus("round_1", "active", "user_owner")).rejects.toThrow("prohibited");

      spy.mockRestore();
    });

    it("rejects review->closed without a closeoutDecisionId, with a clear error", async () => {
      const spy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "review",
        closeoutDecisionId: null,
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(transitionRoundStatus("round_1", "closed", "user_owner")).rejects.toThrow(
        "Closeout Decision required"
      );

      spy.mockRestore();
    });

    it("allows review->closed once a closeoutDecisionId is set", async () => {
      const findSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "review",
        closeoutDecisionId: "decision_1",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "round_1", status: "closed" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await transitionRoundStatus("round_1", "closed", "user_owner");
      expect(result.status).toBe("closed");

      findSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});
