import { describe, it, expect, vi } from "vitest";
import {
  createOrUpdateDraftEvaluation,
  getEvaluationById,
  editSubmittedEvaluation,
} from "@/server/services/evaluation-service";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

const testerProfile = { id: "tester_1", userId: "user_tester_1", approvalStatus: "approved" };
const otherTesterProfile = { id: "tester_2", userId: "user_tester_2", approvalStatus: "approved" };
const assignment = {
  id: "asg_1",
  testerProfileId: "tester_1",
  sampleId: "sample_1",
  revisionId: "revision_1",
  roundId: "round_1",
  requiredSessionCount: 2,
  status: "active",
};

describe("Play Sessions & Evaluations Module Unit Tests (Sprint 1 revision, Step 7)", () => {
  describe("Draft Autosave Upsert", () => {
    it("upserts the same draft row instead of creating duplicates", async () => {
      const profileSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(
        testerProfile as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>
      );
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(
        assignment as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>
      );
      const existingDraft = { id: "eval_1", status: "draft" };
      const evalFindSpy = vi.spyOn(db.query.evaluations, "findFirst").mockResolvedValue(
        existingDraft as unknown as Awaited<ReturnType<typeof db.query.evaluations.findFirst>>
      );
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "eval_1", status: "draft", strengths: "Great pop" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const insertSpy = vi.spyOn(db, "insert");

      const result = await createOrUpdateDraftEvaluation(
        "asg_1",
        { evaluationType: "first_impression", strengths: "Great pop" },
        "user_tester_1"
      );

      expect(result.id).toBe("eval_1");
      expect(insertSpy).not.toHaveBeenCalled();

      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
      evalFindSpy.mockRestore();
      updateSpy.mockRestore();
      insertSpy.mockRestore();
    });
  });

  describe("Submitted Evaluation Immutability", () => {
    it("does not accept assignmentId/sampleId/revisionId in the correction payload (they are never part of the update)", async () => {
      const profileSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(
        testerProfile as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>
      );
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(
        assignment as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>
      );
      // Decision 1: a submitted evaluation is locked and can only be edited after the owner
      // reopens it - status must be "reopened" here, not "submitted", to reach the correction
      // path this test actually exercises (payload sanitization).
      const submittedEval = {
        id: "eval_1",
        assignmentId: "asg_1",
        sampleId: "sample_1",
        revisionId: "revision_1",
        roundId: "round_1",
        status: "reopened",
      };
      const evalFindSpy = vi.spyOn(db.query.evaluations, "findFirst").mockResolvedValue(
        submittedEval as unknown as Awaited<ReturnType<typeof db.query.evaluations.findFirst>>
      );
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      let capturedSetPayload: Record<string, unknown> = {};
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: (payload: Record<string, unknown>) => {
          capturedSetPayload = payload;
          return {
            where: () => ({
              returning: () => Promise.resolve([{ id: "eval_1", status: "updated" }]),
            }),
          };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      // A crafted payload attempting to smuggle assignmentId/sampleId/revisionId through -
      // simulating a hand-built request body that bypasses the TS input type.
      const craftedPayload = {
        evaluationType: "first_impression",
        strengths: "Edited strengths",
        assignmentId: "asg_HIJACKED",
        sampleId: "sample_HIJACKED",
        revisionId: "revision_HIJACKED",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      await editSubmittedEvaluation("eval_1", craftedPayload, "user_tester_1");

      expect(capturedSetPayload).not.toHaveProperty("assignmentId");
      expect(capturedSetPayload).not.toHaveProperty("sampleId");
      expect(capturedSetPayload).not.toHaveProperty("revisionId");
      expect(capturedSetPayload.strengths).toBe("Edited strengths");

      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
      evalFindSpy.mockRestore();
      roundSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("blocks edits once the parent round is closed", async () => {
      const profileSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(
        testerProfile as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>
      );
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(
        assignment as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>
      );
      // Decision 1: only a "reopened" evaluation reaches the round-closed check at all - a merely
      // "submitted" one is blocked earlier by the lock itself, which is a separate, correct case
      // (see the "does not accept ... in the correction payload" test above for that path).
      const evalFindSpy = vi.spyOn(db.query.evaluations, "findFirst").mockResolvedValue({
        id: "eval_1",
        assignmentId: "asg_1",
        roundId: "round_1",
        status: "reopened",
      } as unknown as Awaited<ReturnType<typeof db.query.evaluations.findFirst>>);
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "closed",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(
        editSubmittedEvaluation("eval_1", { evaluationType: "first_impression" }, "user_tester_1")
      ).rejects.toThrow("closed");

      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
      evalFindSpy.mockRestore();
      roundSpy.mockRestore();
    });

    it("Decision 1: rejects an edit to a submitted evaluation that has not been reopened by the owner", async () => {
      const profileSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(
        testerProfile as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>
      );
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(
        assignment as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>
      );
      const evalFindSpy = vi.spyOn(db.query.evaluations, "findFirst").mockResolvedValue({
        id: "eval_1",
        assignmentId: "asg_1",
        roundId: "round_1",
        status: "submitted",
      } as unknown as Awaited<ReturnType<typeof db.query.evaluations.findFirst>>);

      await expect(
        editSubmittedEvaluation("eval_1", { evaluationType: "first_impression" }, "user_tester_1")
      ).rejects.toThrow("locked");

      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
      evalFindSpy.mockRestore();
    });
  });

  describe("IDOR Protection", () => {
    it("refuses to return an evaluation belonging to a different tester's assignment", async () => {
      const evaluation = { id: "eval_1", assignmentId: "asg_1" };
      const evalFindSpy = vi.spyOn(db.query.evaluations, "findFirst").mockResolvedValue(
        evaluation as unknown as Awaited<ReturnType<typeof db.query.evaluations.findFirst>>
      );
      // Caller is tester_2, but the assignment belongs to tester_1 - ownership query returns
      // nothing because of the AND(id, testerProfileId) binding.
      const profileSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(
        otherTesterProfile as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>
      );
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined);

      await expect(getEvaluationById("eval_1", "user_tester_2")).rejects.toThrow(AppError);
      await expect(getEvaluationById("eval_1", "user_tester_2")).rejects.toThrow("not found");

      evalFindSpy.mockRestore();
      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
    });
  });

  describe("Follow-Up Gating", () => {
    it("blocks Follow-Up evaluation creation until the required session count is met", async () => {
      const profileSpy = vi.spyOn(db.query.testerProfiles, "findFirst").mockResolvedValue(
        testerProfile as unknown as Awaited<ReturnType<typeof db.query.testerProfiles.findFirst>>
      );
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(
        assignment as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>
      );
      // Only 1 of the 2 required sessions logged.
      const sessionsSpy = vi.spyOn(db.query.playSessions, "findMany").mockResolvedValue(
        [{ id: "session_1" }] as unknown as Awaited<ReturnType<typeof db.query.playSessions.findMany>>
      );
      const evaluationsSpy = vi.spyOn(db.query.evaluations, "findMany").mockResolvedValue(
        [{ evaluationType: "first_impression", status: "submitted" }] as unknown as Awaited<
          ReturnType<typeof db.query.evaluations.findMany>
        >
      );
      // getEvaluationProgress also checks the parent round's status; assignment.roundId is
      // truthy here, so this must be mocked too or the call falls through to a real network
      // query and the test hangs until the vitest timeout.
      const roundSpy = vi.spyOn(db.query.testRounds, "findFirst").mockResolvedValue({
        id: "round_1",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.testRounds.findFirst>>);

      await expect(
        createOrUpdateDraftEvaluation("asg_1", { evaluationType: "follow_up" }, "user_tester_1")
      ).rejects.toThrow("locked");

      profileSpy.mockRestore();
      assignmentSpy.mockRestore();
      sessionsSpy.mockRestore();
      evaluationsSpy.mockRestore();
      roundSpy.mockRestore();
    });
  });
});
