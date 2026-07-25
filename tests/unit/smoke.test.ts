import { describe, it, expect } from "vitest";
import { ROLES, SAMPLE_STATUS } from "@/lib/constants";
import { AppError } from "@/lib/errors";

describe("Quality Baseline Smoke Tests", () => {
  it("proves Vitest runner works with local assertions", () => {
    expect(1 + 1).toBe(2);
  });

  it("proves domain constants are resolved properly", () => {
    expect(ROLES.OWNER).toBe("owner");
    expect(SAMPLE_STATUS.READY_FOR_TESTING).toBe("ready_for_testing");
  });

  it("proves AppError functions throw correctly", () => {
    const fn = () => {
      throw AppError.forbidden("Access denied error");
    };
    expect(fn).toThrow(AppError);
    try {
      fn();
    } catch (e: unknown) {
      if (e instanceof AppError) {
        expect(e.code).toBe("FORBIDDEN");
        expect(e.statusCode).toBe(403);
      } else {
        throw e;
      }
    }
  });
});
