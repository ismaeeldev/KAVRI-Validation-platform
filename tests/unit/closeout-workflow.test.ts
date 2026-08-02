import { describe, it, expect, vi } from "vitest";
import { createCloseoutDecision, getEvidenceSummaryForRound } from "@/server/services/closeout-service";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

describe("Closeout Decisions Module Unit Tests (Sprint 1 revision, Step 9)", () => {
  describe("Transactional Round Closing", () => {
    it("auto-closes the round and sets closeoutDecisionId in the same transaction as the decision insert", async () => {
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "review",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      const insertCalls: string[] = [];
      const updateCalls: Record<string, unknown>[] = [];

      const txMock = {
        insert: (_table: unknown) => ({
          values: (v: Record<string, unknown>) => {
            const isDecision = "decisionSummary" in v;
            insertCalls.push(isDecision ? "closeoutDecisions" : "closeoutEvidenceLinks");
            return {
              returning: () => Promise.resolve([{ id: "decision_1", ...v }]),
            };
          },
        }),
        update: (_table: unknown) => ({
          set: (v: Record<string, unknown>) => {
            updateCalls.push(v);
            return { where: () => Promise.resolve() };
          },
        }),
      };

      const txSpy = vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await callback(txMock as any);
      });

      const result = await createCloseoutDecision(
        {
          scope: "round",
          scopeId: "round_1",
          decision: "advance",
          decisionSummary: "Paddle performs well, advancing to production.",
          nextAction: "Move to production tooling.",
        },
        "user_owner"
      );

      expect(result.id).toBe("decision_1");
      expect(insertCalls).toContain("closeoutDecisions");
      expect(updateCalls).toHaveLength(1);
      expect(updateCalls[0].closeoutDecisionId).toBe("decision_1");
      expect(updateCalls[0].status).toBe("closed");

      roundSpy.mockRestore();
      txSpy.mockRestore();
    });

    it("rejects closing a round that is not in 'review' status", async () => {
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(
        createCloseoutDecision(
          {
            scope: "round",
            scopeId: "round_1",
            decision: "advance",
            decisionSummary: "Too early to close.",
            nextAction: "Continue testing.",
          },
          "user_owner"
        )
      ).rejects.toThrow("review");

      roundSpy.mockRestore();
    });
  });

  describe("Limitations Requirement", () => {
    it("rejects a 'gather_more_evidence' decision without limitations text", async () => {
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "review",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(
        createCloseoutDecision(
          {
            scope: "round",
            scopeId: "round_1",
            decision: "gather_more_evidence",
            decisionSummary: "Not enough data yet.",
            nextAction: "Run another round.",
          },
          "user_owner"
        )
      ).rejects.toThrow(AppError);
      await expect(
        createCloseoutDecision(
          {
            scope: "round",
            scopeId: "round_1",
            decision: "gather_more_evidence",
            decisionSummary: "Not enough data yet.",
            nextAction: "Run another round.",
          },
          "user_owner"
        )
      ).rejects.toThrow("Limitations are required");

      roundSpy.mockRestore();
    });
  });

  describe("Evidence Summary Accuracy", () => {
    it("returns counts matching directly-queried evaluations/issues for the round", async () => {
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "review",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      const evaluationRows = [
        { id: "eval_1", status: "submitted" },
        { id: "eval_2", status: "draft" }, // excluded - not submitted
        { id: "eval_3", status: "updated" },
      ];
      const evalSpy = vi.spyOn(db.query.evaluations, "findMany").mockResolvedValue(
        evaluationRows as unknown as Awaited<ReturnType<typeof db.query.evaluations.findMany>>
      );

      const assignmentRows = [
        { id: "asg_1", sampleId: "sample_1" },
        { id: "asg_2", sampleId: "sample_2" },
      ];
      const asgSpy = vi.spyOn(db.query.testingAssignments, "findMany").mockResolvedValue(
        assignmentRows as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findMany>>
      );

      const issueRows = [
        { id: "issue_1", severity: "high", sampleId: "sample_1" },
        { id: "issue_2", severity: "high", sampleId: "sample_2" },
        { id: "issue_3", severity: "low", sampleId: "sample_1" },
      ];
      const issueSpy = vi.spyOn(db.query.issueReports, "findMany").mockResolvedValue(
        issueRows as unknown as Awaited<ReturnType<typeof db.query.issueReports.findMany>>
      );

      const summary = await getEvidenceSummaryForRound("round_1");

      expect(summary.evaluationsSubmittedCount).toBe(2);
      expect(summary.samplesInspectedCount).toBe(2);
      expect(summary.issuesCount).toBe(3);
      expect(summary.issuesBySeverity.high).toBe(2);
      expect(summary.issuesBySeverity.low).toBe(1);

      roundSpy.mockRestore();
      evalSpy.mockRestore();
      asgSpy.mockRestore();
      issueSpy.mockRestore();
    });
  });
});
