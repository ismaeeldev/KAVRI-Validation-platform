import { describe, it, expect, vi } from "vitest";
import { createSample, transitionSampleStatus } from "@/server/services/sample-service";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

describe("Physical Sample Identity & Triage Unit Tests", () => {
  describe("Relational Consistency & Uniqueness Checks", () => {
    it("refuses to create sample if supplier, product, or revision are mismatched", async () => {
      const supplierSpy = vi.spyOn(db.query.suppliers, "findFirst").mockResolvedValue({
        id: "sup_1",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.suppliers.findFirst>>);

      const productSpy = vi.spyOn(db.query.products, "findFirst").mockResolvedValue({
        id: "prod_1",
        supplierId: "sup_2",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.products.findFirst>>);

      await expect(
        createSample(
          {
            sampleCode: "S-MISM-01",
            supplierId: "sup_1",
            productId: "prod_1",
            revisionId: "rev_1",
            receivedAt: "2026-07-23",
            receivingObservations: "Observed",
          },
          "user_owner"
        )
      ).rejects.toThrow("relationship mismatch");

      supplierSpy.mockRestore();
      productSpy.mockRestore();
    });

    it("throws duplicate error if sample code is already registered", async () => {
      const supplierSpy = vi.spyOn(db.query.suppliers, "findFirst").mockResolvedValue({
        id: "sup_1",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.suppliers.findFirst>>);
      const productSpy = vi.spyOn(db.query.products, "findFirst").mockResolvedValue({
        id: "prod_1",
        supplierId: "sup_1",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.products.findFirst>>);
      const revisionSpy = vi.spyOn(db.query.productRevisions, "findFirst").mockResolvedValue({
        id: "rev_1",
        productId: "prod_1",
      } as unknown as Awaited<ReturnType<typeof db.query.productRevisions.findFirst>>);

      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "sample_existing",
        sampleCode: "S-DUP-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      await expect(
        createSample(
          {
            sampleCode: "S-DUP-01",
            supplierId: "sup_1",
            productId: "prod_1",
            revisionId: "rev_1",
            receivedAt: "2026-07-23",
            receivingObservations: "Observed",
          },
          "user_owner"
        )
      ).rejects.toThrow("already allocated");

      supplierSpy.mockRestore();
      productSpy.mockRestore();
      revisionSpy.mockRestore();
      sampleSpy.mockRestore();
    });
  });

  describe("Triage State Machine Transitions", () => {
    it("prohibits invalid transitions", async () => {
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_1",
        status: "received",
        sampleCode: "S-TEST-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      await expect(
        transitionSampleStatus("samp_1", "ready_for_testing", "Observed note", "user_owner")
      ).rejects.toThrow("prohibited");

      sampleSpy.mockRestore();
    });

    it("allows valid transitions", async () => {
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_1",
        status: "received",
        sampleCode: "S-TEST-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "samp_1", status: "under_review" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await transitionSampleStatus("samp_1", "under_review", "Moving to review", "user_owner");
      expect(result.status).toBe("under_review");

      sampleSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });
});
