import { describe, it, expect, vi } from "vitest";
import { createRevision, createProduct, updateRevision } from "@/server/services/product-service";
import { getDualCertificationStatus } from "@/server/services/certification-service";
import { createSupplier, archiveSupplier } from "@/server/services/supplier-service";
import { createSupplierSchema } from "@/lib/validation/schemas";
import { AppError } from "@/lib/errors";
import { db } from "@/db";
import { logActivity } from "@/server/services/activity-service";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

describe("Owner Workflow & Traceability Unit Tests", () => {
  describe("Supplier & Product Constraints", () => {
    it("throws duplicate code error during supplier creation", async () => {
      // Mock db query findFirst to simulate supplier code conflict
      const spy = vi.spyOn(db.query.suppliers, "findFirst").mockResolvedValue({
        id: "sup_1",
        code: "ACME-FAB",
        name: "Acme Fabrications",
      } as unknown as Awaited<ReturnType<typeof db.query.suppliers.findFirst>>);

      await expect(
        createSupplier(
          {
            name: "New Acme Fab",
            code: "ACME-FAB",
            notes: "Some confidential supplier notes.",
            relationshipStatus: "under_evaluation",
          },
          "user_owner"
        )
      ).rejects.toThrow(AppError);

      await expect(
        createSupplier(
          {
            name: "New Acme Fab",
            code: "ACME-FAB",
            notes: "Some confidential supplier notes.",
            relationshipStatus: "under_evaluation",
          },
          "user_owner"
        )
      ).rejects.toThrow("already exists");

      spy.mockRestore();
    });

    it("refuses to link product to an archived supplier", async () => {
      // Mock finding an archived supplier
      const spy = vi.spyOn(db.query.suppliers, "findFirst").mockResolvedValue({
        id: "sup_archived",
        name: "Old Corp",
        status: "archived",
      } as unknown as Awaited<ReturnType<typeof db.query.suppliers.findFirst>>);

      await expect(
        createProduct(
          {
            supplierId: "sup_archived",
            internalName: "Arc Product",
            descriptionInternal: "Confidential specs",
            isPublic: false,
            publicState: "private",
          },
          "user_owner"
        )
      ).rejects.toThrow(AppError);

      await expect(
        createProduct(
          {
            supplierId: "sup_archived",
            internalName: "Arc Product",
            descriptionInternal: "Confidential specs",
            isPublic: false,
            publicState: "private",
          },
          "user_owner"
        )
      ).rejects.toThrow("archived supplier");

      spy.mockRestore();
    });
  });

  describe("Supplier Field Validation & Archive (Sprint 1 revision, Step 2)", () => {
    it("rejects supplier creation without a code", () => {
      const result = createSupplierSchema.safeParse({
        name: "No Code Supplier",
        notes: "Some notes.",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const codeIssue = result.error.issues.find((i) => i.path[0] === "code");
        expect(codeIssue).toBeDefined();
      }
    });

    it("normalizes supplier code case before comparison, and preserves other submitted values alongside the field error", () => {
      // The schema uppercases `code` on parse, so "acme-fab" and "ACME-FAB" are
      // equivalent by the time they reach the duplicate-code check in the service.
      const lower = createSupplierSchema.safeParse({
        name: "Acme Fab (lowercase entry)",
        code: "acme-fab",
        notes: "Notes preserved on validation.",
        relationshipStatus: "under_evaluation",
      });
      expect(lower.success).toBe(true);
      if (lower.success) {
        expect(lower.data.code).toBe("ACME-FAB");
        // Other submitted values must survive parsing untouched (form does not clear on error).
        expect(lower.data.name).toBe("Acme Fab (lowercase entry)");
        expect(lower.data.notes).toBe("Notes preserved on validation.");
      }
    });

    it("archives a supplier with linked products via a soft update, never a delete", async () => {
      const supplierSpy = vi.spyOn(db.query.suppliers, "findFirst").mockResolvedValue({
        id: "sup_linked",
        status: "active",
        code: "LINKED",
      } as unknown as Awaited<ReturnType<typeof db.query.suppliers.findFirst>>);

      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "sup_linked", status: "archived" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await archiveSupplier("sup_linked", "user_owner");
      expect(result.status).toBe("archived");
      expect(updateSpy).toHaveBeenCalledWith(expect.anything());

      supplierSpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe("Product Revision Uniqueness", () => {
    it("refuses to create duplicate revision codes for the same product", async () => {
      // Mock product fetch to return active
      const productSpy = vi.spyOn(db.query.products, "findFirst").mockResolvedValue({
        id: "prod_1",
        internalName: "Product One",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.products.findFirst>>);

      // Mock revision query to simulate existing revision code
      const revisionSpy = vi.spyOn(db.query.productRevisions, "findFirst").mockResolvedValue({
        id: "rev_1",
        productId: "prod_1",
        revisionCode: "REV-A",
      } as unknown as Awaited<ReturnType<typeof db.query.productRevisions.findFirst>>);

      await expect(
        createRevision(
          {
            productId: "prod_1",
            revisionCode: "REV-A",
            revisionReason: "Change density",
            requestedChanges: "Change requested",
            supplierReportedChanges: "Reported changes",
            developmentStage: "prototype",
            isPublic: false,
            spinRating: "not_yet_rated",
            feelQuadrant: "not_yet_assessed",
            publicState: "private",
          },
          "user_owner"
        )
      ).rejects.toThrow(AppError);

      await expect(
        createRevision(
          {
            productId: "prod_1",
            revisionCode: "REV-A",
            revisionReason: "Change density",
            requestedChanges: "Change requested",
            supplierReportedChanges: "Reported changes",
            developmentStage: "prototype",
            isPublic: false,
            spinRating: "not_yet_rated",
            feelQuadrant: "not_yet_assessed",
            publicState: "private",
          },
          "user_owner"
        )
      ).rejects.toThrow("already defined for this product");

      productSpy.mockRestore();
      revisionSpy.mockRestore();
    });
  });

  describe("Product & Revision Module Expansion (Sprint 1 revision, Step 3)", () => {
    it("creates a revision with only required fields (all new spec/assessment fields optional)", async () => {
      const productSpy = vi.spyOn(db.query.products, "findFirst").mockResolvedValue({
        id: "prod_2",
        internalName: "Product Two",
        status: "active",
      } as unknown as Awaited<ReturnType<typeof db.query.products.findFirst>>);
      const revisionSpy = vi.spyOn(db.query.productRevisions, "findFirst").mockResolvedValue(undefined);
      const insertSpy = vi.spyOn(db, "insert").mockReturnValue({
        values: () => ({
          returning: () =>
            Promise.resolve([{ id: "rev_new", productId: "prod_2", revisionCode: "REV-MIN" }]),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await createRevision(
        {
          productId: "prod_2",
          revisionCode: "REV-MIN",
          revisionReason: "Minimal fields only",
          requestedChanges: "None",
          supplierReportedChanges: "None",
          developmentStage: "concept",
          isPublic: false,
          spinRating: "not_yet_rated",
          feelQuadrant: "not_yet_assessed",
          publicState: "private",
        },
        "user_owner"
      );
      expect(result.revisionCode).toBe("REV-MIN");

      productSpy.mockRestore();
      revisionSpy.mockRestore();
      insertSpy.mockRestore();
    });

    it("allows updating a spec field on a revision with zero linked samples", async () => {
      const revisionSpy = vi.spyOn(db.query.productRevisions, "findFirst").mockResolvedValue({
        id: "rev_free",
        revisionCode: "REV-FREE",
        coreThicknessMm: "13",
        shape: null,
      } as unknown as Awaited<ReturnType<typeof db.query.productRevisions.findFirst>>);
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue(undefined);
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "rev_free", coreThicknessMm: "14" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await updateRevision(
        "rev_free",
        {
          revisionReason: "Adjust thickness",
          requestedChanges: "Thicker core",
          supplierReportedChanges: "Confirmed",
          developmentStage: "prototype",
          isPublic: false,
          coreThicknessMm: 14,
          spinRating: "not_yet_rated",
          feelQuadrant: "not_yet_assessed",
          publicState: "private",
        },
        "user_owner"
      );
      expect(result.coreThicknessMm).toBe("14");

      revisionSpy.mockRestore();
      sampleSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("rejects a spec field change on a revision with a linked sample unless isControlledCorrection is set, and logs the correction when it is", async () => {
      const revisionSpy = vi.spyOn(db.query.productRevisions, "findFirst").mockResolvedValue({
        id: "rev_locked",
        revisionCode: "REV-LOCKED",
        coreThicknessMm: "13",
        shape: null,
      } as unknown as Awaited<ReturnType<typeof db.query.productRevisions.findFirst>>);
      const sampleSpy = vi.spyOn(db.query.physicalSamples, "findFirst").mockResolvedValue({
        id: "samp_1",
        revisionId: "rev_locked",
      } as unknown as Awaited<ReturnType<typeof db.query.physicalSamples.findFirst>>);

      const baseInput = {
        revisionReason: "Attempt spec change",
        requestedChanges: "Thicker core",
        supplierReportedChanges: "Confirmed",
        developmentStage: "prototype",
        isPublic: false,
        coreThicknessMm: 16, // differs from the mocked current value of 13
        spinRating: "not_yet_rated",
        feelQuadrant: "not_yet_assessed",
        publicState: "private",
      };

      // Without isControlledCorrection: rejected.
      await expect(updateRevision("rev_locked", baseInput, "user_owner")).rejects.toThrow(AppError);
      await expect(updateRevision("rev_locked", baseInput, "user_owner")).rejects.toThrow("locked");

      // With isControlledCorrection: allowed, and logged as a correction.
      const updateSpy = vi.spyOn(db, "update").mockReturnValue({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([{ id: "rev_locked", coreThicknessMm: "16" }]),
          }),
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const logSpy = logActivity as unknown as ReturnType<typeof vi.fn>;
      logSpy.mockClear();

      const corrected = await updateRevision(
        "rev_locked",
        { ...baseInput, isControlledCorrection: true },
        "user_owner"
      );
      expect(corrected.coreThicknessMm).toBe("16");
      expect(logSpy).toHaveBeenCalledWith(
        "user_owner",
        "revision.corrected",
        "product_revision",
        "rev_locked",
        expect.anything()
      );

      revisionSpy.mockRestore();
      sampleSpy.mockRestore();
      updateSpy.mockRestore();
    });

    it("computes the Dual certification indicator as true only when both USAP and UPA-A are approved", async () => {
      const certSpy = vi.spyOn(db.query.productCertifications, "findMany");

      certSpy.mockResolvedValueOnce([
        { governingBody: "usap", status: "approved" },
        { governingBody: "upa_a", status: "approved" },
      ] as unknown as Awaited<ReturnType<typeof db.query.productCertifications.findMany>>);
      expect(await getDualCertificationStatus("rev_dual")).toBe(true);

      certSpy.mockResolvedValueOnce([
        { governingBody: "usap", status: "approved" },
        { governingBody: "upa_a", status: "submitted" },
      ] as unknown as Awaited<ReturnType<typeof db.query.productCertifications.findMany>>);
      expect(await getDualCertificationStatus("rev_single")).toBe(false);

      certSpy.mockResolvedValueOnce([
        { governingBody: "usap", status: "approved" },
      ] as unknown as Awaited<ReturnType<typeof db.query.productCertifications.findMany>>);
      expect(await getDualCertificationStatus("rev_missing")).toBe(false);

      certSpy.mockRestore();
    });
  });
});
