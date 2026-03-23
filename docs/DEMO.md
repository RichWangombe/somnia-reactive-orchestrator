# Demo

This repo is designed to record cleanly in about 3 minutes 30 seconds.

## Local Demo Commands

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

## Testnet Demo Commands

```bash
pnpm deploy:testnet
pnpm dev:watcher
pnpm dev:web
```

## Click Path

1. Open `/`
2. Go to `/create`
3. Connect wallet
4. Submit Guardian rules
5. Open `/rules`
6. Open `/feed`
7. Trigger a price update from your demo wallet or script
8. Show `RuleFired` and updated balances

## Full Recording Script

### 0:00–0:20 Opening

Spoken:

“This is ROP, the Reactive Intent Rail for Somnia. ROP turns Somnia’s native reactivity into programmable on-chain automation.”

On screen:

- home page hero
- quick glance at the architecture strip

### 0:20–0:55 Rule creation

Spoken:

“Guardian is the first template. It creates two rules: one for price drops and one for vault-health degradation.”

On screen:

- open `/create`
- show the vault and price feed addresses
- set price threshold
- set health-factor threshold
- choose withdraw or swap-to-stable
- submit

### 0:55–1:20 Pre-trigger state

Spoken:

“Nothing is polling here. The watcher is waiting for Somnia Reactivity callbacks, and the UI is waiting on watcher receipts.”

On screen:

- `/rules`
- `/feed`
- current vault state

### 1:20–2:05 Trigger event

Spoken:

“Now I move the mock price feed below the threshold. The watcher receives the event, matches the rule, and dispatches execution on-chain.”

On screen:

- trigger `PriceUpdated`
- show feed receive the price event
- show `rule.matched`
- show `rule.fired`
- show tx hash

### 2:05–2:35 Guardrails

Spoken:

“Cooldowns and execution caps are enforced by the executor, not by the UI.”

On screen:

- trigger again too quickly
- show cooldown behavior
- disable a rule in `/rules`

### 2:35–3:05 Architecture close

Spoken:

“The important piece is the rail: trigger, watcher, executor, action module, receipt.”

On screen:

- architecture doc
- watcher metrics

### 3:05–3:30 Close

Spoken:

“Guardian is the first template, not the whole product. The same rule rail can power treasury automation, compounding, referrals, and game logic.”

## Abbreviated 2-Minute Version

1. Home page
2. Create Guardian
3. Open live feed
4. Trigger price drop
5. Show execution receipt
6. Show rules page and close

## Troubleshooting

- If the feed stays static, confirm the watcher is running and `NEXT_PUBLIC_WATCHER_URL` is correct
- If rule creation fails, confirm `NEXT_PUBLIC_RULE_REGISTRY_ADDRESS` and action-module addresses are set
- If dispatch fails, confirm `PRIVATE_KEY_WATCHER` is funded and trusted by the executor
