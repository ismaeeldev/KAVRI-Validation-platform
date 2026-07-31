import { describe, it, expect, vi } from "vitest";
import { createIssueReport, getRelatedIssues, updateIssueResolution } from "@/server/services/issue-service";
import { createIssueReportSchema } from "@/lib/validation/schemas";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

const sample = { id: "sample_1", sampleCode: "S-001", revisionId: "revision_1" };

describe("Issue Reports Module Unit Tests (Sprint 1 revision, Step 8)", () => {
  describe("Still-Playable Conditional Validation", () => {
    it("rejects a functional issue submitted without stillPlayable", () => {
      const result = createIssueReportSchema.safeParse({
        sampleId: "sample_1",
        category: "core_crush",
        issueType: "functional",
        severity: "moderate",
        firstObservedAt: "2026-07-20",
        description: "Core feels crushed near the throat.",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "stillPlayable");
        expect(issue).toBeDefined();
      }
    });

    it("accepts a functional issue with stillPlayable provided", () => {
      const result = createIssueReportSchema.safeParse({
        sampleId: "sample_1",
        category: "core_crush",
        issueType: "functional",
        severity: "moderate",
        firstObservedAt: "2026-07-20",
        description: "Core feels crushed near the throat.",
        stillPlayable: "yes",
      });
      expect(result.success).toBe(true);
    });

    it("does not require stillPlayable for a cosmetic issue", () => {
      const result = createIssueReportSchema.safeParse({
        sampleId: "sample_1",
        category: "cosmetic",
        issueType: "cosmetic",
        severity: "low",
        firstObservedAt: "2026-07-20",
        description: "Minor paint scuff on the face.",
      });
      expect(result.success).toBe(true);
    });

    it("rejects at the service layer too, defense-in-depth against a crafted request bypassing the zod schema", async () => {
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue(
        sample as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>
      );

      await expect(
        createIssueReport(
          {
            sampleId: "sample_1",
            category: "core_crush",
            issueType: "functional",
            severity: "moderate",
            firstObservedAt: "2026-07-20",
            description: "Core feels crushed.",
          },
          "user_owner",
          "owner"
        )
      ).rejects.toThrow(AppError);

      sampleSpy.mockRestore();
    });
  });

  describe("Recurrence Detection", () => {
    it("returns issues sharing the same revisionId across different samples", async () => {
      const relatedRow = { id: "issue_2", sampleId: "sample_2", revisionId: "revision_1", category: "core_crush" };
      const findManySpy = vi.spyOn(db.query.issueReports, "findMany").mockResolvedValue(
        [relatedRow] as unknown as Awaited<ReturnType<typeof db.query.issueReports.findMany>>
      );

      const related = await getRelatedIssues("sample_1", "revision_1");

      expect(related).toHaveLength(1);
      expect(related[0].sampleId).toBe("sample_2");
      expect(related[0].revisionId).toBe("revision_1");

      findManySpy.mockRestore();
    });
  });

  describe("Owner-Only Resolution Authority", () => {
    it("rejects a tester attempting to set the resolution", async () => {
      await expect(
        updateIssueResolution("issue_1", { resolutionStatus: "resolved" }, "user_tester_1", "tester")
      ).rejects.toThrow(AppError);
      await expect(
        updateIssueResolution("issue_1", { resolutionStatus: "resolved" }, "user_tester_1", "tester")
      ).rejects.toThrow("Only the owner");
    });

    it("allows the owner to set immediateAction and resolutionStatus", async () => {
      const issueFindSpy = vi.spyOn(db.query.issueReports, "findFirst").mockResolvedValue({
        id: "issue_1",
        resolutionStatus: "open",
      } as unknown as Awaited<ReturnType<typeof db.query.issueReports.findFirst>>);
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "issue_1", resolutionStatus: "resolved", immediateAction: "monitor" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await updateIssueResolution(
        "issue_1",
        { immediateAction: "monitor", resolutionStatus: "resolved" },
        "user_owner",
        "owner"
      );

      expect(result.resolutionStatus).toBe("resolved");
      expect(result.immediateAction).toBe("monitor");

      issueFindSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});
