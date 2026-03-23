# ROP | Reactive Intent Rail

Somnia makes event-driven smart contracts possible. ROP turns that primitive into an automation rail.

ROP is a hackathon-grade monorepo for the Somnia Reactivity Mini Hackathon. It packages a general rule protocol, a reactive watcher/dispatcher, and a clean frontend around one flagship demo: **Reactive Guardian**, a DeFi protection workflow that creates on-chain rules for price drops and vault-health deterioration.

## What ROP Is

ROP models automation as reusable rules:

`WHEN on-chain trigger X happens AND condition Y is true THEN execute action Z`

The current MVP includes:

- `RuleRegistry` for storing trigger, condition, action, and execution limits
- `ReactiveExecutor` for cooldown enforcement, daily execution caps, and action dispatch
- Action modules for `WITHDRAW_FROM_VAULT`, `SWAP_TO_STABLE`, and `EMIT_ONLY`
- A watcher that subscribes to Somnia Reactivity in real mode and simulates that callback path in mock mode
- A Next.js UI for templates, rule creation, user rule inventory, and live execution receipts

## Why Somnia Reactivity Matters

ROP is intentionally built around Somnia’s native reactivity model instead of polling:

- The watcher subscribes to on-chain events in real time
- In real mode, the Somnia adapter can bundle view calls with event subscriptions so callback data includes fresh chain state
- In mock mode, the same rule engine runs against local contract events for deterministic demos
- Execution still lands on-chain through `ReactiveExecutor`, so the demo shows both reactive detection and protocol-level execution

## Architecture

High-level flow:

1. The user creates one or more rules in `RuleRegistry`
2. Somnia Reactivity pushes matching events into the watcher
3. The watcher normalizes the event, suppresses duplicates, loads candidate rules, and evaluates conditions
4. If a rule matches, the watcher submits `ReactiveExecutor.fire(ruleId, triggerPayload)`
5. The executor enforces cooldown and daily caps, then calls an action module
6. The watcher streams execution receipts to the UI over SSE

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the detailed diagram.

## Repo Structure

```text
/apps
  /contracts   Hardhat contracts, deploy scripts, and tests
  /watcher     Somnia Reactivity watcher and SSE feed
  /web         Next.js UI
  /scripts     Guided demo and utility scripts
/packages
  /shared      ABIs, schemas, constants, and demo data
/docs          Architecture, reactivity, security, demo, and submission docs
```

## Quickstart

### 1. Install

```bash
pnpm install
```

### 2. Run in local mock mode

Terminal 1:

```bash
pnpm --filter @rop/contracts exec hardhat node
```

Terminal 2:

```bash
pnpm deploy:local
pnpm seed:demo
```

Terminal 3:

```bash
pnpm dev:watcher
```

Terminal 4:

```bash
pnpm dev:web
```

Copy the addresses from `deployments/localhost.json` into `apps/web/.env.local` and `apps/watcher/.env.local`.

### 3. Useful scripts

```bash
pnpm build
pnpm test
pnpm lint
pnpm demo
```

## Deploy To Somnia Testnet

Defaults:

- Chain ID: `50312`
- RPC: `https://dream-rpc.somnia.network/`

Steps:

1. Fill `.env` with `PRIVATE_KEY_DEPLOYER` and `PRIVATE_KEY_WATCHER`
2. Run `pnpm deploy:testnet`
3. Copy `deployments/somniaTestnet.json` addresses into the watcher and web env files
4. Run `pnpm dev:watcher`
5. Run `pnpm dev:web`

## How Reactivity Is Used

- `apps/watcher/src/reactivity.ts` is the official Somnia integration boundary
- `REAL` mode uses `@somnia-chain/reactivity`
- `MOCK_MODE=true` swaps that adapter for deterministic local subscriptions in `apps/watcher/src/mock-mode.ts`
- Both adapters normalize their callbacks into the same rule evaluation path

More detail lives in [REACTIVITY.md](./docs/REACTIVITY.md).

## Demo Flow

The hackathon story is simple:

1. Create a Guardian rule pair
2. Show the live feed waiting
3. Drop the price or degrade health factor
4. Watch the watcher receive the event and submit execution
5. Show `RuleFired` plus updated balances
6. Demonstrate cooldowns or disablement

See [DEMO.md](./docs/DEMO.md) for the exact recording script.

## Security Model

This MVP deliberately uses a **trusted watcher relay**. That keeps the architecture tight for the hackathon while still letting the rule protocol, execution receipts, and action-module model be credible. Guardrails include:

- cooldowns
- max executions/day
- duplicate event suppression
- explicit action-module allowlisting by address

Details: [SECURITY.md](./docs/SECURITY.md)

## Future Roadmap

- richer trigger filters and state-aware conditions
- rule marketplaces and protocol-authored strategy packs
- decentralized executor set
- analytics over trigger and action graphs
- agent-authored automation recipes on top of the same rule rail
