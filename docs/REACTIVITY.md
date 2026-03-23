# Reactivity

ROP uses Somnia Reactivity as the event intake layer.

## Why No Polling

The architecture does not run cron jobs or polling loops to discover contract changes. Instead:

- real mode subscribes to contract events through Somnia Reactivity
- mock mode simulates the same callback path for deterministic local demos

The rule engine is identical in both modes once an event has been normalized.

## Integration Boundary

All Somnia-specific wiring is isolated to:

- `apps/watcher/src/reactivity.ts`

That file decides between:

- `REAL` mode via `@somnia-chain/reactivity`
- `MOCK_MODE=true` via local contract listeners in `apps/watcher/src/mock-mode.ts`

## Event Coverage

The current watcher subscribes to:

- `PriceUpdated` on `MockPriceFeed`
- `HealthFactorChanged` on `MockVault`

Those are enough to show:

- price-threshold automation
- vault-health automation
- multi-rule Guardian workflows

## Atomic State Bundling

The real Somnia adapter is designed to use `ethCalls` alongside the event subscription where useful.

Current examples:

- `latestPrice()` bundled with `PriceUpdated`
- optional `getHealthFactor(user)` bundled with `HealthFactorChanged`

That keeps the architecture aligned with Somnia’s event-plus-state model even though the watcher still owns final rule matching and transaction dispatch.

## Mock Mode

`MOCK_MODE=true` exists for demo reliability:

- it avoids blocking local development on testnet credentials
- it keeps the watcher UI and feed fully usable
- it preserves the same rule normalization and executor dispatch path

This is the correct hackathon tradeoff: the product story stays reactive, but the repo remains runnable anywhere.
