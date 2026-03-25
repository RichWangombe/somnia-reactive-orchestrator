"use client";

import { watcherFeedEventSchema, type WatcherFeedEvent } from "@rop/shared";
import { useEffect, useState } from "react";

import { appConfig } from "./config";

export function useWatcherFeed() {
  const [events, setEvents] = useState<WatcherFeedEvent[]>([]);

  useEffect(() => {
    const source = new EventSource(`${appConfig.watcherUrl}/events`);
    source.onmessage = (message) => {
      try {
        const parsed = watcherFeedEventSchema.parse(JSON.parse(message.data));
        setEvents((previous) => [parsed, ...previous].slice(0, 24));
      } catch {
        // Ignore malformed messages from local development.
      }
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, []);

  return events;
}

export function useWatcherMetrics() {
  const [metrics, setMetrics] = useState<Record<string, number>>({});

  useEffect(() => {
    let disposed = false;

    async function readMetrics() {
      try {
        const response = await fetch(`${appConfig.watcherUrl}/metrics`, {
          cache: "no-store",
        });
        const data = (await response.json()) as Record<string, number>;
        if (!disposed) {
          setMetrics(data);
        }
      } catch {
        if (!disposed) {
          setMetrics({});
        }
      }
    }

    void readMetrics();
    const timer = window.setInterval(() => {
      void readMetrics();
    }, 5000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, []);

  return metrics;
}
