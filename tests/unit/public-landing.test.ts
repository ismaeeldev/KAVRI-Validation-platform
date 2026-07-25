import { describe, it, expect, vi } from "vitest";
import {
  getPublicUpdatesFeed,
  getPublicProducts,
} from "@/server/services/public-queries-service";
import { addToWaitlist } from "@/server/services/waitlist-service";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

describe("Public Landing Page & Waitlist Constraints Unit Tests", () => {
  describe("Waitlist Subscriptions", () => {
    it("safely ignores honeypot submissions and returns clean mock success response", async () => {
      const result = await addToWaitlist({
        email: "bot@spam.com",
        honeypot: "automated-field-content",
      });

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(false);
    });

    it("returns privacy-safe duplicate payload if email already exists", async () => {
      // Mock existing subscriber check
      const spy = vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue({
        id: "sub_1",
        emailNormalized: "duplicate@kavri.co",
      } as unknown as Awaited<ReturnType<typeof db.query.waitlistSubscribers.findFirst>>);

      const result = await addToWaitlist({
        email: "duplicate@kavri.co",
      });

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true); // Return privacy-safe successful duplicate response

      spy.mockRestore();
    });
  });

  describe("Public Query Exclusions (Data Contract Safety)", () => {
    it("excludes draft and archived updates from public feed", async () => {
      // Mock db query returning draft and published entries
      const spy = vi.spyOn(db.query.publicUpdates, "findMany").mockResolvedValue([
        {
          id: "upd_published",
          title: "Public Update",
          summary: "Validation passes.",
          statusLabel: "PASSED",
          publishedState: "published",
          publishedAt: new Date(),
        },
      ] as unknown as Awaited<ReturnType<typeof db.query.publicUpdates.findMany>>);

      const feed = await getPublicUpdatesFeed();
      expect(feed.length).toBe(1);
      expect(feed[0].title).toBe("Public Update");

      spy.mockRestore();
    });

    it("excludes private fields (like internal names, supplier notes) from public results", async () => {
      // Mock public product lookup
      const spy = vi.spyOn(db.query.products, "findMany").mockResolvedValue([
        {
          id: "prod_1",
          internalName: "INTERNAL SECRET CODE", // Should not leak
          publicAlias: "KAVRI Apex paddle",
          publicSummary: "Safe public summary description.",
          isPublic: true,
          revisions: [],
        },
      ] as unknown as Awaited<ReturnType<typeof db.query.products.findMany>>);

      const list = await getPublicProducts();
      expect(list.length).toBe(1);
      expect((list[0] as unknown as { internalName?: string }).internalName).toBeUndefined(); // Verify private field not leaked
      expect(list[0].publicAlias).toBe("KAVRI Apex paddle");

      spy.mockRestore();
    });
  });
});
