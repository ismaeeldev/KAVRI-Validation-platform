import { describe, it, expect } from "vitest";
import { csvEscape, rowsToCsv, type CsvColumn } from "@/lib/csv-export";

// Every module's CSV export (Step 18) reuses rowsToCsv/csvEscape rather than reimplementing
// escaping logic - this covers the shared behavior once for all of them.
describe("Shared CSV Export Utility Unit Tests (Sprint 1 revision, Step 18)", () => {
  describe("csvEscape", () => {
    it("wraps values containing commas, quotes, or newlines in quotes and doubles inner quotes", () => {
      expect(csvEscape("plain")).toBe("plain");
      expect(csvEscape("a, b")).toBe('"a, b"');
      expect(csvEscape('say "hi"')).toBe('"say ""hi"""');
      expect(csvEscape("line1\nline2")).toBe('"line1\nline2"');
    });

    it("renders null/undefined as an empty string", () => {
      expect(csvEscape(null)).toBe("");
      expect(csvEscape(undefined)).toBe("");
    });

    it("renders Date values as ISO strings", () => {
      expect(csvEscape(new Date("2026-01-01T00:00:00.000Z"))).toBe("2026-01-01T00:00:00.000Z");
    });

    it("renders booleans and numbers as their string form", () => {
      expect(csvEscape(true)).toBe("true");
      expect(csvEscape(42)).toBe("42");
    });
  });

  describe("rowsToCsv", () => {
    interface Row {
      name: string;
      note: string | null;
    }

    const columns: CsvColumn<Row>[] = [
      { header: "Name", value: (r) => r.name },
      { header: "Note", value: (r) => r.note },
    ];

    it("produces a header row followed by one row per input, correctly escaped", () => {
      const csv = rowsToCsv<Row>(
        [
          { name: "Alpha", note: "simple" },
          { name: "Beta, Inc.", note: 'has "quotes"' },
        ],
        columns
      );

      const lines = csv.split("\n");
      expect(lines[0]).toBe("Name,Note");
      expect(lines[1]).toBe("Alpha,simple");
      expect(lines[2]).toBe('"Beta, Inc.","has ""quotes"""');
    });

    it("produces only a header row for an empty input", () => {
      const csv = rowsToCsv<Row>([], columns);
      expect(csv).toBe("Name,Note");
    });
  });
});
