import * as http from "node:http";

import { watcherDefaultPort, type WatcherFeedEvent } from "@rop/shared";

import { loadConfig } from "./config";
import { createClients, loadRules } from "./contracts";
import { handlePriceUpdated } from "./handlers/priceUpdated";
import { handleVaultHealthChanged } from "./handlers/vaultHealthChanged";
import { IdempotencyStore } from "./idempotency";
import { logger } from "./logger";
import { Metrics } from "./metrics";
import { ExecutionQueue } from "./queue";
import { startReactivity } from "./reactivity";
import type { NormalizedReactiveEvent } from "./types/events";

async function main() {
  const config = await loadConfig();
  const clients = createClients(config);
  const metrics = new Metrics();
  const queue = new ExecutionQueue(1, 2);
  const idempotency = new IdempotencyStore(config.idempotencyFile);
  idempotency.load();

  const sseClients = new Set<http.ServerResponse>();

  const publish = (event: WatcherFeedEvent) => {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of sseClients) {
      client.write(payload);
    }
  };

  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, mode: config.mockMode ? "mock" : "real" }));
      return;
    }

    if (req.url === "/metrics") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(metrics.snapshot()));
      return;
    }

    if (req.url === "/events") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        "access-control-allow-origin": config.allowedOrigin,
      });
      res.write("retry: 1000\n\n");
      sseClients.add(res);
      req.on("close", () => {
        sseClients.delete(res);
      });
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  server.listen(config.apiPort, () => {
    logger.info("Watcher API listening", {
      port: config.apiPort || watcherDefaultPort,
      mockMode: config.mockMode,
    });
  });

  const loadRulesFromChain = () => loadRules(clients.publicClient, config.addresses.ruleRegistry);

  const onEvent = async (event: NormalizedReactiveEvent) => {
    metrics.increment("eventsSeen");

    if (!idempotency.markIfNew(event.key)) {
      metrics.increment("duplicatesDropped");
      return;
    }

    if (event.kind === "PRICE_UPDATED") {
      await handlePriceUpdated(event, {
        loadRules: loadRulesFromChain,
        queue,
        metrics,
        publish,
        dispatchDeps: {
          executorAddress: config.addresses.reactiveExecutor,
          publicClient: clients.publicClient,
          walletClient: clients.walletClient,
          account: clients.account,
        },
      });
      return;
    }

    await handleVaultHealthChanged(event, {
      loadRules: loadRulesFromChain,
      queue,
      metrics,
      publish,
      dispatchDeps: {
        executorAddress: config.addresses.reactiveExecutor,
        publicClient: clients.publicClient,
        walletClient: clients.walletClient,
        account: clients.account,
      },
    });
  };

  const stop = await startReactivity({
    config,
    publicClient: clients.publicClient,
    onEvent,
  });

  publish({
    id: "watcher-online",
    type: "system",
    title: "Watcher online",
    description: `ROP watcher started in ${config.mockMode ? "mock" : "Somnia Reactivity"} mode.`,
    timestamp: new Date().toISOString(),
    metadata: {
      apiPort: config.apiPort,
    },
  });

  const shutdown = async () => {
    logger.info("Shutting down watcher");
    await stop();
    for (const client of sseClients) {
      client.end();
    }
    server.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });
}

main().catch((error) => {
  logger.error("Watcher crashed", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;
});
