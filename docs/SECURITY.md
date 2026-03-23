# Security

ROP is a hackathon MVP, not a production automation protocol.

## Current Guardrails

- `ReactiveExecutor` only accepts calls from a trusted watcher
- cooldowns are enforced on-chain
- max executions per day are enforced on-chain
- duplicate event keys are suppressed in the watcher
- failed executions are surfaced as receipts instead of being silently swallowed

## Trusted Relay Assumption

The watcher is intentionally trusted for the MVP. That keeps the scope realistic while still demonstrating:

- a general rule format
- an execution rail
- pluggable action modules
- execution receipts

The path to a stronger design is straightforward:

- signed watcher attestations
- multiple executors
- stake/slash relay set
- permissionless execution with deterministic matching proofs

## Duplicate And Replay Handling

The watcher stores event keys in a local idempotency cache. If the same event shows up twice, it is dropped before rule evaluation.

This is sufficient for a hackathon demo, but not a final replay-protection design.

## Mock Contract Caveats

The demo DeFi contracts are deliberately simplified:

- `MockVault` is not economically realistic
- `MockDEX` is not a real AMM
- `MockStablecoin` has operator minting

These contracts exist to make the reactivity story legible, not to represent audited DeFi primitives.

## Action Module Risk

Action modules are powerful by design. In a fuller protocol:

- action-module registration would be permissioned or governed
- templates would be versioned
- simulations would be mandatory
- strategy risk would be surfaced before activation
