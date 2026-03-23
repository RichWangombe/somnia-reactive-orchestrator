import * as fs from "node:fs";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { IdempotencyStore } from "../src/idempotency";

const tempFile = path.resolve(process.cwd(), ".cache", "watcher-idempotency.test.json");

afterEach(() => {
  if (fs.existsSync(tempFile)) {
    fs.unlinkSync(tempFile);
  }
});

describe("IdempotencyStore", () => {
  it("marks a new event key once and then rejects duplicates", () => {
    const store = new IdempotencyStore(tempFile);
    store.load();

    expect(store.markIfNew("event-1")).toBe(true);
    expect(store.markIfNew("event-1")).toBe(false);
  });
});
