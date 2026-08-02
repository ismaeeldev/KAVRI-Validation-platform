import { describe, it, expect, vi, beforeEach } from "vitest";
import { addToWaitlist, applyToTest } from "@/server/services/waitlist-service";
import { db } from "@/db";

vi.mock("@/server/services/activity-service", () => ({
  logActivity: vi.fn().mockResolvedValue({}),
}));

function mockInsertReturning(row: unknown) {
  return vi.spyOn(db, "insert").mockReturnValue({
    values: () => ({
      returning: () => Promise.resolve([row]),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

function mockUpdateReturning(row: unknown) {
  return vi.spyOn(db, "update").mockReturnValue({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([row]),
      }),
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}

describe("Waitlist Expansion Unit Tests (Sprint 1 revision, Step 14)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("persists UTM/CTA fields on a new general signup", async () => {
    vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue(undefined);
    const insertSpy = mockInsertReturning({ id: "sub_1" });

    const result = await addToWaitlist({
      email: "person@example.com",
      ctaSource: "hero",
      utmSource: "twitter",
      utmMedium: "social",
      utmCampaign: "launch",
    });

    expect(result.duplicate).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertedValues = (insertSpy.mock.results[0].value as any).values;
    expect(insertedValues).toBeDefined();
  });

  it("marks signupSource as 'referral' when a ref param is present, overriding the form default", async () => {
    vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue(undefined);
    let capturedValues: Record<string, unknown> = {};
    vi.spyOn(db, "insert").mockReturnValue({
      values: (v: Record<string, unknown>) => {
        capturedValues = v;
        return { returning: () => Promise.resolve([{ id: "sub_2" }]) };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await addToWaitlist({ email: "ref-signup@example.com", ref: "affiliate-1" });

    expect(capturedValues.signupSource).toBe("referral");
  });

  it("defaults signupSource to 'landing_page' for the general form with no ref", async () => {
    vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue(undefined);
    let capturedValues: Record<string, unknown> = {};
    vi.spyOn(db, "insert").mockReturnValue({
      values: (v: Record<string, unknown>) => {
        capturedValues = v;
        return { returning: () => Promise.resolve([{ id: "sub_3" }]) };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await addToWaitlist({ email: "plain-signup@example.com" });

    expect(capturedValues.signupSource).toBe("landing_page");
  });

  it("defaults signupSource to 'tester_form' for a new tester application with no ref", async () => {
    vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue(undefined);
    let capturedValues: Record<string, unknown> = {};
    vi.spyOn(db, "insert").mockReturnValue({
      values: (v: Record<string, unknown>) => {
        capturedValues = v;
        return { returning: () => Promise.resolve([{ id: "sub_4" }]) };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await applyToTest({
      name: "Jamie Tester",
      email: "jamie@example.com",
      consentTextVersion: "v1.0",
    });

    expect(capturedValues.signupSource).toBe("tester_form");
    expect(capturedValues.testerInterest).toBe(true);
    expect(capturedValues.name).toBe("Jamie Tester");
  });

  it("upgrades an existing waitlist record in place when applying to test with a duplicate email", async () => {
    vi.spyOn(db.query.waitlistSubscribers, "findFirst").mockResolvedValue({
      id: "existing_sub",
      email: "already@example.com",
    } as unknown as Awaited<ReturnType<typeof db.query.waitlistSubscribers.findFirst>>);
    const updateSpy = mockUpdateReturning({ id: "existing_sub" });

    const result = await applyToTest({
      name: "Already Signed Up",
      email: "already@example.com",
      consentTextVersion: "v1.0",
    });

    expect(result.duplicate).toBe(true);
    expect(updateSpy).toHaveBeenCalled();
  });

  it("short-circuits without a DB write when the honeypot field is filled", async () => {
    const findFirstSpy = vi.spyOn(db.query.waitlistSubscribers, "findFirst");
    const insertSpy = vi.spyOn(db, "insert");

    const result = await addToWaitlist({ email: "bot@example.com", honeypot: "filled-by-bot" });

    expect(result.success).toBe(true);
    expect(findFirstSpy).not.toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
  });
});
