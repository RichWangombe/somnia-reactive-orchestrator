import * as fs from "node:fs";
import * as path from "node:path";

export class IdempotencyStore {
  private seen = new Map<string, number>();

  constructor(
    private readonly filePath: string,
    private readonly ttlMs = 24 * 60 * 60 * 1000,
  ) {}

  load() {
    if (!fs.existsSync(this.filePath)) {
      return;
    }

    const raw = fs.readFileSync(this.filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, number>;
    for (const [key, value] of Object.entries(parsed)) {
      this.seen.set(key, value);
    }
    this.prune();
  }

  markIfNew(key: string): boolean {
    this.prune();
    if (this.seen.has(key)) {
      return false;
    }

    this.seen.set(key, Date.now());
    this.persist();
    return true;
  }

  private prune() {
    const cutoff = Date.now() - this.ttlMs;
    for (const [key, value] of this.seen.entries()) {
      if (value < cutoff) {
        this.seen.delete(key);
      }
    }
  }

  private persist() {
    const directory = path.dirname(this.filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const serialized = Object.fromEntries(this.seen.entries());
    fs.writeFileSync(this.filePath, `${JSON.stringify(serialized, null, 2)}\n`, "utf8");
  }
}
