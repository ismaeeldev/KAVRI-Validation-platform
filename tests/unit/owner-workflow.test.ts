import { describe, it, expect, vi } from "vitest";
import { createRevision, createProduct } from "@/server/services/product-service";
import { createSupplier } from "@/server/services/supplier-service";
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
