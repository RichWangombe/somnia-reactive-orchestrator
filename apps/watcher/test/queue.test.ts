import { describe, expect, it } from "vitest";

import { ExecutionQueue } from "../src/queue";

describe("ExecutionQueue", () => {
  it("retries failed jobs and eventually resolves", async () => {
    const queue = new ExecutionQueue(1, 2);
    let attempts = 0;

    const result = await queue.enqueue("retryable", async () => {
      attempts += 1;
      if (attempts < 2) {
        throw new Error("try again");
      }
      return "ok";
    });

    expect(result).toBe("ok");
    expect(attempts).toBe(2);
  });
});
