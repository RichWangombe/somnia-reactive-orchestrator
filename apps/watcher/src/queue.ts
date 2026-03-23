type Task = {
  label: string;
  attempt: number;
  run: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
};

export class ExecutionQueue {
  private readonly queue: Task[] = [];
  private active = 0;

  constructor(
    private readonly concurrency = 1,
    private readonly maxRetries = 2,
  ) {}

  enqueue<T>(label: string, run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        label,
        attempt: 0,
        run: () => run(),
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      void this.drain();
    });
  }

  private async drain() {
    if (this.active >= this.concurrency) {
      return;
    }
    const next = this.queue.shift();
    if (!next) {
      return;
    }

    this.active += 1;
    try {
      const value = await next.run();
      next.resolve(value);
    } catch (error) {
      if (next.attempt < this.maxRetries) {
        next.attempt += 1;
        this.queue.push(next);
      } else {
        next.reject(error);
      }
    } finally {
      this.active -= 1;
      void this.drain();
    }
  }
}
