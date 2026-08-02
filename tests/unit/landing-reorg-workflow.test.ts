import { describe, it, expect, vi } from "vitest";
import {
  getPublicWhatChangedAndWhy,
  getPublicSampleSummaries,
} from "@/server/services/public-queries-service";
import { db } from "@/db";

// Mimics Drizzle's chainable select() query builder: .from()/.innerJoin()/.where() all return
// `this`-like chain objects, and the chain is awaitable (thenable) at any point after .where(),
// whether or not .orderBy() is called next (getPublicWhatChangedAndWhy stops at .where(),
// getPublicSampleSummaries continues to .orderBy()).
function mockSelectChain(results: unknown[][]) {
  let call = 0;
  return vi.spyOn(db, "select").mockImplementation(() => {
    const result = results[call] ?? [];
    call += 1;
    const chain = {
      from: () => chain,
      innerJoin: () => chain,
      where: () => ({
        ...chain,
        then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(result).then(onFulfilled),
      }),
      orderBy: () => Promise.resolve(result),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    return chain;
  });
}

describe("Landing Page Reorganization Unit Tests (Sprint 1 revision, Step 15)", () => {
  describe("getPublicWhatChangedAndWhy", () => {
    it("returns only an explicit field allowlist (id, publicVersion, evidenceStrength, decisionDate) — no decisionSummary, limitations, or scopeId", async () => {
      const spy = mockSelectChain([
        [
          {
            id: "decision_1",
            publicVersion: "We adjusted the core density after repeated durability testing.",
            evidenceStrength: "repeated_observation",
            decisionDate: new Date("2026-01-05T00:00:00.000Z"),
          },
        ],
        [],
      ]);

      const result = await getPublicWhatChangedAndWhy();

      expect(result).toHaveLength(1);
      expect(Object.keys(result[0]).sort()).toEqual(
        ["decisionDate", "evidenceStrength", "id", "publicVersion"].sort()
      );
      spy.mockRestore();
    });

    it("filters out decisions with no publicVersion set", async () => {
      const spy = mockSelectChain([
        [
          {
            id: "decision_no_public",
            publicVersion: null,
            evidenceStrength: "early_signal",
            decisionDate: new Date("2026-01-01T00:00:00.000Z"),
          },
        ],
        [],
      ]);

      const result = await getPublicWhatChangedAndWhy();

      expect(result).toHaveLength(0);
      spy.mockRestore();
    });

    it("merges and sorts revision-scoped and product-scoped decisions by decisionDate descending", async () => {
      const spy = mockSelectChain([
        [
          {
            id: "revision_decision",
            publicVersion: "Revision-level change.",
            evidenceStrength: "directional_evidence",
            decisionDate: new Date("2026-01-01T00:00:00.000Z"),
          },
        ],
        [
          {
            id: "product_decision",
            publicVersion: "Product-level change.",
            evidenceStrength: "strong_internal_confidence",
            decisionDate: new Date("2026-02-01T00:00:00.000Z"),
          },
        ],
      ]);

      const result = await getPublicWhatChangedAndWhy();

      expect(result.map((r) => r.id)).toEqual(["product_decision", "revision_decision"]);
      spy.mockRestore();
    });
  });

  describe("getPublicSampleSummaries", () => {
    it("never returns supplierId, sampleCode, or internal notes fields — only alias and statusLabel", async () => {
      const spy = mockSelectChain([
        [
          { status: "assigned", receivedAt: new Date("2026-01-01T00:00:00.000Z") },
          { status: "received", receivedAt: new Date("2026-01-02T00:00:00.000Z") },
        ],
      ]);

      const result = await getPublicSampleSummaries();

      expect(result).toHaveLength(2);
      for (const sample of result) {
        expect(Object.keys(sample).sort()).toEqual(["alias", "statusLabel"]);
      }
      expect(result[0].alias).toBe("Specimen A");
      expect(result[1].alias).toBe("Specimen B");
      spy.mockRestore();
    });

    it("maps unknown internal statuses to a safe generic label rather than leaking the raw value", async () => {
      const spy = mockSelectChain([
        [{ status: "some_future_internal_status", receivedAt: new Date() }],
      ]);

      const result = await getPublicSampleSummaries();

      expect(result[0].statusLabel).toBe("In Progress");
      spy.mockRestore();
    });
  });
});
