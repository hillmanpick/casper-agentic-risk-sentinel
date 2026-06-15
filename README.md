# Casper Agentic Risk Sentinel

Casper Agentic Risk Sentinel is an Agentic AI risk assistant for DeFi and real-world asset actions on Casper.

Before an autonomous agent signs a transaction, rebalances a portfolio, transfers funds, or publishes an RWA update, the app reviews the proposed action and returns one of three decisions:

- `APPROVE`
- `REQUIRE_HUMAN_CONFIRMATION`
- `BLOCK`

Each review includes a risk score, failed checks, explanation, missing information, and a deterministic review hash that is designed to be recorded on Casper Testnet.

## Why This Fits Casper Agentic Buildathon

The project focuses on:

- Agentic AI safety before execution
- DeFi and RWA workflows
- Transparent review hashes
- Casper Testnet audit records
- Minimal on-chain data storage

The on-chain layer stores only the review hash, decision, and action category. The full review remains off-chain to avoid leaking private user data.

## Demo Flow

1. Choose one of the built-in scenarios:
   - DeFi rebalance review
   - RWA risk update
   - Unsafe agent action
2. Adjust action parameters such as exposure, evidence freshness, destination trust, and protocol health.
3. Click `Review before execution`.
4. The app returns a structured decision.
5. The app computes a SHA-256 `review_hash`.
6. The Casper audit panel shows the fields intended for Testnet storage.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Test

```bash
npm test
npm run build
```

## Repository Structure

```text
/src
  React demo UI and deterministic risk engine

/contracts/risk_review_registry
  Casper contract sketch for recording risk review hashes

/docs
  Casper Testnet integration notes

/examples
  Sample action JSON

/public
  Project logo
```

## Casper Testnet Component

The MVP includes a Casper contract sketch with a `record_review` entry point:

```text
record_review(review_id, review_hash, decision, action_category)
```

To complete a live Testnet transaction, configure:

- Casper Testnet account
- Testnet CSPR from the faucet
- Casper CLI or Casper JavaScript SDK
- Compiled contract Wasm
- Contract hash after installation

Then call `record_review` with a real review hash produced by the demo.

## Limitations

This MVP is a safety and audit layer demo. It does not provide financial advice, execute real DeFi trades, or store private user data on-chain. A final buildathon submission should add a real Casper Testnet transaction hash after deployment.

## Demo Video

The local demo can be recorded with:

```bash
npm run demo:record
```

The video file will be written to `demo-output/`.
