# Casper Testnet Integration

Casper Agentic Risk Sentinel is built around a small on-chain proof pattern:

1. The agent receives a proposed DeFi or RWA action.
2. The risk engine returns a structured review object.
3. The app computes a SHA-256 hash of that review object.
4. A Casper contract records the hash, decision label, and action category.
5. The demo links the generated review to a Casper Testnet transaction.

## What The MVP Does Today

- Produces deterministic review records in the browser.
- Computes a review hash.
- Shows the exact fields intended for on-chain storage.
- Includes a Casper Rust contract sketch for the `record_review` entry point.

## What Is Needed For A Real Testnet Transaction

- A Casper Testnet account.
- Testnet CSPR from the official faucet.
- Casper CLI or Casper JavaScript SDK.
- A compiled contract Wasm.
- A contract hash after installation.

## Suggested Final Submission Path

```text
npm install
npm run build

# Then, after setting up the Casper CLI and a funded Testnet account:
# 1. compile contracts/risk_review_registry/contract.rs to Wasm
# 2. install the Wasm on Casper Testnet
# 3. call record_review with a review_id, review_hash, decision, action_category
# 4. add the resulting transaction hash to README and the demo video
```

## References

- Casper TypeScript/JavaScript SDK
- Casper Testnet faucet
- Casper Rust smart contract guide
- Casper contract installation guide
