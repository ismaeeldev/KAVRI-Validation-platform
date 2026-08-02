import { describe, it, expect, vi } from "vitest";
import { getDashboardSummary } from "@/server/services/dashboard-service";
import { db } from "@/db";

describe("Owner Dashboard Needs Attention / Active Work Unit Tests (Sprint 1 revision, Step 11)", () => {
  it("returns only the fixture rows matching each Needs Attention / Active Work criterion, not all rows", async () => {
    const sampleSpy = vi.spyOn(db.query.physicalSamples, "findMany").mockResolvedValue(
      [{ id: "sample_1", status: "received" }] as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findMany>>
    );

    const testerSpy = vi.spyOn(db.query.testerProfiles, "findMany").mockResolvedValue([
      { id: "tester_needs_invite", approvalStatus: "approved" },
      { id: "tester_already_invited", approvalStatus: "approved" },
    ] as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findMany>>);

    const selectDistinctSpy = vi.spyOn(db, "selectDistinct").mockReturnValue({
      from: () => Promise.resolve([{ testerProfileId: "tester_already_invited" }]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // No assignments/testingAssignments data needed for the overdue/active counts in this test -
    // getAssignments() hits db.query.testingAssignments.findMany with relations.
    const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findMany").mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findMany>>
    );

    const issueSpy = vi.spyOn(db.query.issueReports, "findMany").mockResolvedValue([
      { id: "issue_1", severity: "high", resolutionStatus: "open" },
    ] as unknown as Awaited<ReturnType<typeof db.query.issueReports.findMany>>);

    // testRounds.findMany is called twice (review-status rounds, then active-status rounds) -
    // return different fixtures per call using mockImplementation with an internal counter.
    let roundCallCount = 0;
    const roundSpy = vi.spyOn(db.query.testRounds, "findMany").mockImplementation((async () => {
      roundCallCount += 1;
      if (roundCallCount === 1) {
        return [{ id: "round_review_1", status: "review" }];
      }
      return [
        { id: "round_active_1", status: "active" },
        { id: "round_active_2", status: "active" },
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any);

    const updateSpy = vi.spyOn(db.query.publicUpdates, "findMany").mockResolvedValue(
      [{ id: "update_1", publishedState: "draft" }] as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findMany>>
    );

    const evaluationSpy = vi.spyOn(db.query.evaluations, "findMany").mockResolvedValue(
      [{ id: "eval_1", status: "draft" }] as unknown as Awaited<ReturnType<typeof db.query.evaluations.findMany>>
    );

    const summary = await getDashboardSummary();

    expect(summary.needsAttention.samplesAwaitingInspectionCount).toBe(1);
    expect(summary.needsAttention.testersNeedingInvitationCount).toBe(1);
    expect(summary.needsAttention.overdueAssignmentsCount).toBe(0);
    expect(summary.needsAttention.criticalOpenIssuesCount).toBe(1);
    expect(summary.needsAttention.roundsNeedingCloseoutCount).toBe(1);

    expect(summary.activeWork.activeRoundsCount).toBe(2);
    expect(summary.activeWork.activeAssignmentsCount).toBe(0);
    expect(summary.activeWork.draftEvaluationsCount).toBe(1);
    expect(summary.activeWork.draftUpdatesCount).toBe(1);

    sampleSpy.mockRestore();
    testerSpy.mockRestore();
    selectDistinctSpy.mockRestore();
    assignmentSpy.mockRestore();
    issueSpy.mockRestore();
    roundSpy.mockRestore();
    updateSpy.mockRestore();
    evaluationSpy.mockRestore();
  });
});
