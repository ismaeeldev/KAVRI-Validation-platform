import { describe, it, expect, vi } from "vitest";
import { createSample, transitionSampleStatus, getCurrentHolder } from "@/server/services/sample-service";
import { authorizePhotoAttachment } from "@/server/services/attachment-service";
import { AppError } from "@/lib/errors";
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

  describe("Physical Sample Module Expansion (Sprint 1 revision, Step 4)", () => {
    it("rejects invalid transitions for the 3 new statuses (assigned/returned/retired) the same way as existing states", async () => {
      // 'retired' is terminal - no transitions out.
      const retiredSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_retired",
        status: "retired",
        sampleCode: "S-RETIRED-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);
      await expect(
        transitionSampleStatus("samp_retired", "ready_for_testing", "Attempt reuse", "user_owner")
      ).rejects.toThrow("prohibited");
      retiredSpy.mockRestore();

      // 'ready_for_testing' cannot jump straight to 'returned' (must go through 'assigned' first).
      const readySpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_ready",
        status: "ready_for_testing",
        sampleCode: "S-READY-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);
      await expect(
        transitionSampleStatus("samp_ready", "returned", "Invalid skip", "user_owner")
      ).rejects.toThrow("prohibited");
      readySpy.mockRestore();

      // 'assigned' -> 'retired' directly is not allowed; must return first.
      const assignedSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_assigned",
        status: "assigned",
        sampleCode: "S-ASSIGNED-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);
      await expect(
        transitionSampleStatus("samp_assigned", "retired", "Invalid skip", "user_owner")
      ).rejects.toThrow("prohibited");
      assignedSpy.mockRestore();
    });

    it("allows the new valid transitions: ready_for_testing -> assigned -> returned -> retired", async () => {
      // Counter declared OUTSIDE the mocked chain so it persists across the 3 calls below -
      // nesting it inside `where: () => (...)` would re-initialize it on every invocation.
      let call = 0;
      const results = [
        [{ id: "samp_flow", status: "assigned" }],
        [{ id: "samp_flow", status: "returned" }],
        [{ id: "samp_flow", status: "retired" }],
      ];
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve(results[call++]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const sampleSpy = vi
        .spyOn(db.query.physicalSamples, "findFirst")
        .mockResolvedValueOnce({ id: "samp_flow", status: "ready_for_testing", sampleCode: "S-FLOW-01" } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>)
        .mockResolvedValueOnce({ id: "samp_flow", status: "assigned", sampleCode: "S-FLOW-01" } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>)
        .mockResolvedValueOnce({ id: "samp_flow", status: "returned", sampleCode: "S-FLOW-01" } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      try {
        const step1 = await transitionSampleStatus("samp_flow", "assigned", "System assign", "user_owner");
        expect(step1.status).toBe("assigned");
        const step2 = await transitionSampleStatus("samp_flow", "returned", "Tester returned it", "user_owner");
        expect(step2.status).toBe("returned");
        const step3 = await transitionSampleStatus("samp_flow", "retired", "End of life", "user_owner");
        expect(step3.status).toBe("retired");
      } finally {
        sampleSpy.mockRestore();
        updateSpy.mockRestore();
      }
    });

    it("generates a unique shortCode/qrValue per sample", async () => {
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
      // No existing sample with this code, and no shortCode collision on first try.
      const sampleFindSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue(undefined);

      const insertedValues: Record<string, unknown>[] = [];
      const insertSpy = vi.spyOn(db, "insert").mockReturnValue({
        values: (v: Record<string, unknown>) => {
          insertedValues.push(v);
          return {
            returning: () => Promise.resolve([{ id: "samp_new", ...v }]),
          };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      try {
        const result = await createSample(
          {
            sampleCode: "S-QR-01",
            supplierId: "sup_1",
            productId: "prod_1",
            revisionId: "rev_1",
            receivedAt: "2026-07-23",
            receivingObservations: "Observed",
          },
          "user_owner"
        );

        expect(result.shortCode).toBeTruthy();
        expect(result.qrValue).toBeTruthy();
        expect(String(result.qrValue)).toContain(String(result.shortCode));
        expect(insertedValues[0].shortCode).toBeTruthy();
      } finally {
        supplierSpy.mockRestore();
        productSpy.mockRestore();
        revisionSpy.mockRestore();
        sampleFindSpy.mockRestore();
        insertSpy.mockRestore();
      }
    });

    it("getCurrentHolder returns 'KAVRI' for every non-'assigned' status", async () => {
      for (const status of ["received", "under_review", "ready_for_testing", "blocked", "rejected", "returned", "retired"]) {
        const spy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
          id: "samp_holder",
          status,
          sampleCode: "S-HOLDER-01",
        } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);
        expect(await getCurrentHolder("samp_holder")).toBe("KAVRI");
        spy.mockRestore();
      }

      const assignedSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_holder",
        status: "assigned",
        sampleCode: "S-HOLDER-01",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);
      expect(await getCurrentHolder("samp_holder")).not.toBe("KAVRI");
      assignedSpy.mockRestore();
    });

    it("rejects photo attachment authorization for a tester with no assignment on the sample, allows the owner unconditionally", async () => {
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue(undefined);

      await expect(
        authorizePhotoAttachment("sample", "samp_1", "tester_user_no_assignment", "tester")
      ).rejects.toThrow(AppError);
      await expect(
        authorizePhotoAttachment("sample", "samp_1", "tester_user_no_assignment", "tester")
      ).rejects.toThrow("active assignment");

      // Owner is never blocked, regardless of assignment existence.
      await expect(authorizePhotoAttachment("sample", "samp_1", "owner_user", "owner")).resolves.toBeUndefined();

      assignmentSpy.mockRestore();
    });

    it("allows photo attachment authorization for a tester who has an active assignment on the sample", async () => {
      const assignmentSpy = vi.spyOn(db.query.testingAssignments, "findFirst").mockResolvedValue({
        id: "assign_1",
        sampleId: "samp_1",
        testerUserId: "tester_user_assigned",
      } as unknown as Awaited<ReturnType<typeof db.query.testingAssignments.findFirst>>);

      await expect(authorizePhotoAttachment("sample", "samp_1", "tester_user_assigned", "tester")).resolves.toBeUndefined();

      assignmentSpy.mockRestore();
    });
  });
});
