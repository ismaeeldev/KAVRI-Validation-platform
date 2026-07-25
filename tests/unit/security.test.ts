import { describe, it, expect, vi } from "vitest";
import { normalizeEmail } from "@/lib/utils";
import { hashToken, generateSecureToken } from "@/server/services/invitation-service";
import { AppError } from "@/lib/errors";
import { requireSession } from "@/lib/permissions";
import { auth } from "@/lib/auth";

// Mock next/headers for requireSession tests
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}));

describe("Security Foundation Unit Tests", () => {
  describe("Email Normalization", () => {
    it("converts email to lowercase and trims whitespace", () => {
      expect(normalizeEmail("  TEST@example.com  ")).toBe("test@example.com");
      expect(normalizeEmail("USER.NAME@KAVRI.CO")).toBe("user.name@kavri.co");
    });
  });

  describe("Cryptographic Tokens & Hashing", () => {
    it("generates 64-character hex tokens (32 bytes)", () => {
      const token = generateSecureToken();
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
    });

    it("hashes tokens consistently using SHA-256", () => {
      const token = "some_secure_test_token_string";
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).toBe("a16d746f4541c0dcda7be624278482a56a5062b90085ce9297d1f71cba8e8979");
    });
  });

  describe("Permission Helpers & Session Guard", () => {
    it("throws AUTHENTICATION_REQUIRED error if no session exists", async () => {
      // Mock auth.api.getSession to return null
      const spy = vi.spyOn(auth.api, "getSession").mockResolvedValue(null);

      await expect(requireSession()).rejects.toThrow(AppError);
      await expect(requireSession()).rejects.toThrow("Authentication is required");

      spy.mockRestore();
    });

    it("returns session object if session is present", async () => {
      const mockSession = {
        user: { id: "user_123", email: "test@example.com", name: "Tester" },
        session: { expiresAt: new Date(), token: "session_tok" },
      } as unknown as Awaited<ReturnType<typeof auth.api.getSession>>;

      const spy = vi.spyOn(auth.api, "getSession").mockResolvedValue(mockSession);

      const result = await requireSession();
      expect(result).toBe(mockSession);
      expect(result.user.id).toBe("user_123");

      spy.mockRestore();
    });
  });
});
