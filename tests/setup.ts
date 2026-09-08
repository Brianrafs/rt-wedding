import { vi } from "vitest";

// Node tests exercise server modules outside Next's React server resolver.
vi.mock("server-only", () => ({}));
