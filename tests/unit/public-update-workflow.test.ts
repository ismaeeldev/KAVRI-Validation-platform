import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  transitionPublicUpdate,
  publishDueScheduledUpdates,
  createPublicUpdate,
} from "@/server/services/public-update-service";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

describe("Public Update Workflow Unit Tests (Sprint 1 revision, Step 13)", () => {
  describe("6-State Publication Workflow", () => {
    it("rejects an invalid transition (e.g. draft directly to published)", async () => {
      const findSpy = vi.spyOn(db.query.publicUpdates, "findFirst").mockResolvedValue({
        id: "update_1",
        publishedState: "draft",
      } as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findFirst>>);

      await expect(transitionPublicUpdate("update_1", "published", "user_owner")).rejects.toThrow(AppError);
      await expect(transitionPublicUpdate("update_1", "published", "user_owner")).rejects.toThrow("prohibited");

      findSpy.mockRestore();
    });

    it("allows the full draft -> internal_review -> approved -> published sequence", async () => {
      const sequence: [string, string][] = [
        ["draft", "internal_review"],
        ["internal_review", "approved"],
        ["approved", "published"],
      ];

      for (const [from, to] of sequence) {
        const findSpy = vi.spyOn(db.query.publicUpdates, "findFirst").mockResolvedValue({
          id: "update_1",
          publishedState: from,
        } as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findFirst>>);
        const updateSpy = vi.spyOn(db, "update").mockReturnValue({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([{ id: "update_1", publishedState: to }]),
            }),
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const result = await transitionPublicUpdate("update_1", to, "user_owner");
        expect(result.publishedState).toBe(to);

        findSpy.mockRestore();
        updateSpy.mockRestore();
      }
    });

    it("requires a scheduledFor date/time when transitioning to 'scheduled'", async () => {
      const findSpy = vi.spyOn(db.query.publicUpdates, "findFirst").mockResolvedValue({
        id: "update_1",
        publishedState: "approved",
      } as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findFirst>>);

      await expect(transitionPublicUpdate("update_1", "scheduled", "user_owner")).rejects.toThrow(
        "scheduled publish date/time is required"
      );

      findSpy.mockRestore();
    });
  });

  describe("Observation/Evidence Level/Limitation/Next Action Persistence", () => {
    it("persists all 4 fields distinct from title/summary", async () => {
      const insertSpy = vi.spyOn(db, "insert").mockReturnValue({
        values: (v: Record<string, unknown>) => ({
          returning: () => Promise.resolve([{ id: "update_new", ...v }]),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await createPublicUpdate(
        {
          title: "Core weave iteration 3",
          summary: "Summary shown as the card body.",
          statusLabel: "IN PROGRESS",
          observation: "Consistent flex under load in bench testing.",
          evidenceLevel: "directional",
          limitation: "Small sample size (n=3).",
          nextAction: "Expand to a full validation round.",
        },
        "user_owner"
      );

      expect(result.title).toBe("Core weave iteration 3");
      expect(result.summary).toBe("Summary shown as the card body.");
      expect(result.observation).toBe("Consistent flex under load in bench testing.");
      expect(result.evidenceLevel).toBe("directional");
      expect(result.limitation).toBe("Small sample size (n=3).");
      expect(result.nextAction).toBe("Expand to a full validation round.");
      // Distinct fields - summary must not be echoed into any of the 4 new columns.
      expect(result.observation).not.toBe(result.summary);

      insertSpy.mockRestore();
    });
  });

  describe("Scheduled Publish Cron Job", () => {
    it("publishes a due scheduled update and leaves a not-yet-due one untouched", async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 60 * 60 * 1000);
      const future = new Date(now.getTime() + 60 * 60 * 1000);

      const findManySpy = vi.spyOn(db.query.publicUpdates, "findMany").mockResolvedValue([
        { id: "update_due", scheduledFor: past },
        { id: "update_not_due", scheduledFor: future },
      ] as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findMany>>);

      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => Promise.resolve(),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const publishedIds = await publishDueScheduledUpdates();

      expect(publishedIds).toContain("update_due");
      expect(publishedIds).not.toContain("update_not_due");

      findManySpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});

describe("Scheduled Publish Cron Route Auth (Sprint 1 revision, Step 13)", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
    vi.restoreAllMocks();
  });

  it("rejects requests missing the CRON_SECRET bearer header", async () => {
    const { GET } = await import("@/app/api/cron/publish-scheduled-updates/route");
    const request = { headers: { get: () => null } } as unknown as Parameters<typeof GET>[0];

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("rejects requests with the wrong CRON_SECRET", async () => {
    const { GET } = await import("@/app/api/cron/publish-scheduled-updates/route");
    const request = {
      headers: { get: () => "Bearer wrong-secret" },
    } as unknown as Parameters<typeof GET>[0];

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("accepts requests with the correct CRON_SECRET and runs the publish check", async () => {
    const findManySpy = vi.spyOn(db.query.publicUpdates, "findMany").mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findMany>>
    );

    const { GET } = await import("@/app/api/cron/publish-scheduled-updates/route");
    const request = {
      headers: { get: () => "Bearer test-cron-secret" },
    } as unknown as Parameters<typeof GET>[0];

    const response = await GET(request);
    expect(response.status).toBe(200);

    findManySpy.mockRestore();
  });
});
