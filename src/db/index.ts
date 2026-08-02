import "server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import dns from "dns";
import ws from "ws";

// Configure WebSocket constructor for `@neondatabase/serverless` in Node.js
neonConfig.webSocketConstructor = ws;

// Resolve connection timeout issues by forcing IPv4 resolution first on local systems (skipped during tests)
if (process.env.NODE_ENV !== "test") {
  dns.setDefaultResultOrder("ipv4first");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

// In Next.js dev mode, this module can be re-executed multiple times as routes are compiled
// on demand (Fast Refresh / Turbopack), each time creating a brand new Pool. Without caching
// the instance across reloads, old pools are never closed and their WebSocket connections
// accumulate for the lifetime of the dev server process, eventually exhausting Neon's
// connection limit under sustained use. Caching on globalThis in development ensures reloads
// reuse the same Pool instead of leaking a new one every time.
declare global {
  // eslint-disable-next-line no-var
  var __kavriDbPool: Pool | undefined;
}

const pool =
  process.env.NODE_ENV === "production"
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : (globalThis.__kavriDbPool ??= new Pool({ connectionString: process.env.DATABASE_URL }));

export const db = drizzle(pool, { schema });
export default db;
