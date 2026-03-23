"use client";

import { MetricCard } from "./MetricCard";
import { StatusBadge } from "./StatusBadge";
import { useWatcherFeed, useWatcherMetrics } from "../lib/reactivity";
import { formatRelativeTime } from "../lib/utils";

export function LiveFeed() {
  const events = useWatcherFeed();
  const metrics = useWatcherMetrics();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Events Seen" value={String(metrics.eventsSeen ?? 0)} />
        <MetricCard label="Rules Matched" value={String(metrics.rulesMatched ?? 0)} />
        <MetricCard label="Avg Latency" value={`${Number(metrics.avgLatencyMs ?? 0).toFixed(0)}ms`} />
      </div>

      <div className="panel rounded-[32px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Watcher feed</div>
            <h2 className="mt-3 text-3xl text-white">Execution receipts in real time</h2>
          </div>
          <StatusBadge label="SSE stream" tone="live" />
        </div>

        <div className="mt-8 space-y-4">
          {events.map((event) => (
            <div key={event.id} className="rounded-3xl border border-white/10 bg-slate-950/45 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="text-lg text-white">{event.title}</div>
                  <div className="text-sm text-slate-300">{event.description}</div>
                </div>
                <StatusBadge label={event.type} tone={event.type === "rule.failed" ? "upcoming" : "muted"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                <span>{formatRelativeTime(event.timestamp)}</span>
                {event.ruleId ? <span>Rule #{event.ruleId}</span> : null}
                {event.txHash ? <span>{event.txHash.slice(0, 10)}...</span> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
