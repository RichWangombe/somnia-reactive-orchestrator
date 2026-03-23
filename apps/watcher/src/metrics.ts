export class Metrics {
  private counters = {
    eventsSeen: 0,
    duplicatesDropped: 0,
    rulesMatched: 0,
    executionsAttempted: 0,
    executionsSucceeded: 0,
    executionsFailed: 0,
  };

  private latencies: number[] = [];

  increment<K extends keyof Metrics["counters"]>(key: K) {
    this.counters[key] += 1;
  }

  recordLatency(ms: number) {
    this.latencies.push(ms);
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
  }

  snapshot() {
    const totalLatency = this.latencies.reduce((acc, value) => acc + value, 0);
    const avgLatencyMs = this.latencies.length === 0 ? 0 : totalLatency / this.latencies.length;

    return {
      ...this.counters,
      avgLatencyMs,
      latencySamples: this.latencies.length,
    };
  }
}
