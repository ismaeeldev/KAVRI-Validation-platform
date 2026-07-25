import "@testing-library/jest-dom";
import { vi } from "vitest";
import * as dotenv from "dotenv";

// Load local environment variables for tests
dotenv.config({ path: ".env.local" });

// Mock server-only module for Vitest runtime
vi.mock("server-only", () => ({}));
