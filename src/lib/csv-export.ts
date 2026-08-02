// Deliberately has no "server-only" guard - list-page tables filter client-side (see
// supplier-directory-table.tsx and siblings), so CSV export for those runs entirely in the
// browser against the already-authorized, already-filtered in-memory rows (Step 18 item 2:
// "export the filtered view, not always the full table"). Server-only export paths (e.g.
// waitlist-service.ts, which has no client-side filter state to respect) also reuse this file.

export function csvEscape(value: string | number | boolean | null | undefined | Date): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined | Date;
}

export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => csvEscape(c.header)).join(",");
  const body = rows.map((row) => columns.map((c) => csvEscape(c.value(row))).join(","));
  return [header, ...body].join("\n");
}
