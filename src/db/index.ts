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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
export default db;
