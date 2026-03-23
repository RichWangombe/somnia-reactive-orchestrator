# Submission

## Project Name

ROP — Reactive Intent Rail

## One-Liner

Programmable on-chain automation for Somnia.

## Repo Link

Add your public repository URL here.

## Deployed Addresses

Copy the contents of `deployments/somniaTestnet.json` here before submitting.

## How Somnia Reactivity Was Used

- The watcher subscribes to on-chain events through Somnia Reactivity in real mode
- The watcher normalizes those callbacks into deterministic rule evaluations
- Matching rules are executed on-chain through `ReactiveExecutor`
- The live feed surfaces those execution receipts immediately to the user

## Judging Criteria Mapping

### Technical Excellence

The project includes a real rule registry, executor, modular action architecture, deploy scripts, and tests.

### Real-Time UX

The UI surfaces watcher events and executor receipts as a live feed.

### Somnia Integration

The watcher is designed around Somnia Reactivity instead of polling and targets Shannon testnet defaults.

### Potential Impact

Guardian is the demo, but the protocol is positioned as a reusable automation rail for DeFi, treasury ops, referrals, and other reactive apps.
