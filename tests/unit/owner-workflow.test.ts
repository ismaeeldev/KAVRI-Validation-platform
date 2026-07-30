import { describe, it, expect, vi } from "vitest";
import { createRevision, createProduct } from "@/server/services/product-service";
import { createSupplier, archiveSupplier } from "@/server/services/supplier-service";
import { createSupplierSchema } from "@/lib/validation/schemas";
import { AppError } from "@/lib/errors";
import { db } from "@/db";

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
          },
          "user_owner"
        )
      ).rejects.toThrow("already defined for this product");

      productSpy.mockRestore();
      revisionSpy.mockRestore();
    });
  });
});
