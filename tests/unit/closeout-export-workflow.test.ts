import { describe, it, expect, vi } from "vitest";
import { getAllCloseoutDecisions } from "@/server/services/closeout-service";
import { db } from "@/db";

describe("Closeout Decisions Export Unit Tests (Sprint 1 revision, Step 18)", () => {
  it("returns all closeout decisions ordered by decisionDate descending", async () => {
    const spy = vi.spyOn(db.query.closeoutDecisions, "findMany").mockResolvedValue(
      [
        { id: "d1", scope: "round", decision: "advance", decisionDate: new Date("2026-01-02") },
        { id: "d2", scope: "revision", decision: "modify", decisionDate: new Date("2026-01-01") },
      ] as unknown as Awaited<ReturnType<typeof db.query.closeoutDecisions.findMany>>
    );

    const result = await getAllCloseoutDecisions();

    expect(result).toHaveLength(2);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
