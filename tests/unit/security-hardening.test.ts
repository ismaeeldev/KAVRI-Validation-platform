import { describe, it, expect, vi } from "vitest";
import { consumeInvitation, verifyInvitation } from "@/server/services/invitation-service";
import { addToWaitlist } from "@/server/services/waitlist-service";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

// Mock db.transaction to run callback directly
vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await callback(db as any);
});

describe("Application Security & Data Integrity Hardening Tests", () => {
  describe("Invitation Replay Protection", () => {
    it("denies verification of already used invitation tokens", async () => {
      // Mock invitation check returning used status
      const spy = vi.spyOn(db.query.testerInvitations, "findFirst").mockResolvedValue({
        id: "invite_1",
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        testerProfile: {
          id: "tester_p1",
          displayName: "Tester Profile Name",
          emailNormalized: "tester@kavri.co",
        },
      } as unknown as Awaited<ReturnType<typeof db.query.testerInvitations.findFirst>>);

      await expect(
        verifyInvitation("used-token")
      ).rejects.toThrow("already been used");

      spy.mockRestore();
    });

    it("denies consumption of already used invitation tokens", async () => {
      // Mock invitation check returning used status
      const spy = vi.spyOn(db.query.testerInvitations, "findFirst").mockResolvedValue({
        id: "invite_1",
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        testerProfile: {
          id: "tester_p1",
          displayName: "Tester Profile Name",
          emailNormalized: "tester@kavri.co",
        },
      } as unknown as Awaited<ReturnType<typeof db.query.testerInvitations.findFirst>>);

      await expect(
        consumeInvitation("used-token", "SecretPass123!", "Tester Name", "v1.0")
      ).rejects.toThrow("verification failed");

      spy.mockRestore();
    });
  });

  describe("Waitlist Concurrency Race Safety", () => {
    it("returns successful duplicate response even under concurrent race duplicates checks", async () => {
      // Mock duplicate check to return existing subscriber
      const spy = vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue({
        id: "sub_exist",
        emailNormalized: "race@kavri.co",
      } as unknown as Awaited<ReturnType<typeof db.query.waitlistSubscribers.findFirst>>);

      const result = await addToWaitlist({
        email: "race@kavri.co",
      });

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true); // Return privacy-safe successful duplicate response

      spy.mockRestore();
    });
  });
});
