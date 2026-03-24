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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Events Seen" value={String(metrics.eventsSeen ?? 0)} detail="Raw trigger notifications observed by the watcher." />
        <MetricCard label="Rules Matched" value={String(metrics.rulesMatched ?? 0)} detail="Rules that crossed threshold and qualified for execution." />
        <MetricCard
          label="Executions Succeeded"
          value={String(metrics.executionsSucceeded ?? 0)}
          detail="Action module calls that completed on-chain."
        />
        <MetricCard label="Avg Latency" value={`${Number(metrics.avgLatencyMs ?? 0).toFixed(0)}ms`} detail="Match to transaction receipt timing." />
      </div>

      <div className="panel rounded-[36px] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">Watcher feed</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              Execution receipts in real time
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Every item below represents something the rail actually observed or executed. The tape is supposed to explain
              the protocol, not just decorate it.
            </p>
          </div>
          <StatusBadge label="SSE stream" tone="live" />
        </div>

        <div className="mt-8 space-y-4">
          {events.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/40 px-5 py-8 text-sm leading-7 text-slate-400">
              No events yet. Trigger the rail from the terminal with <span className="text-white">pnpm demo:price-drop</span> and
              keep this page open.
            </div>
          ) : null}

          {events.map((event) => {
            const failure = event.type === "rule.failed";

            return (
              <div key={event.id} className="panel-soft relative overflow-hidden rounded-[30px] border border-white/10 p-5">
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    failure ? "bg-amber-400/60" : "bg-emerald-300/55"
                  }`}
                />

                <div className="ml-3">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="text-xl font-semibold tracking-[-0.03em] text-white">{event.title}</div>
                      <div className="max-w-3xl text-sm leading-7 text-slate-300">{event.description}</div>
                    </div>
                    <StatusBadge label={event.type} tone={failure ? "upcoming" : "muted"} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      {formatRelativeTime(event.timestamp)}
                    </div>
                    {event.ruleId ? (
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Rule #{event.ruleId}
                      </div>
                    ) : null}
                    {event.txHash ? (
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        {event.txHash.slice(0, 10)}...
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
