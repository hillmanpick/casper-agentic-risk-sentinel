# Risk Review Registry Contract

This directory documents the Casper Testnet on-chain component for Casper Agentic Risk Sentinel.

The contract is intentionally small:

- record a risk review hash
- store the decision label
- store the action category
- expose a read path for audit checks

The full review remains off-chain. The contract should not store personal data, private documents, prompts, secrets, wallet metadata, or financial advice.

## Entry Point

```text
record_review(review_id: String, review_hash: String, decision: String, action_category: String)
```

## Stored Record

```json
{
  "review_id": "defi-rebalance-casper-vault-...",
  "review_hash": "0x...",
  "decision": "REQUIRE_HUMAN_CONFIRMATION",
  "action_category": "defi_rebalance"
}
```

## Testnet Status

The frontend already generates deterministic review hashes. To complete the final Casper Testnet requirement, configure a funded Casper Testnet account and deploy the contract Wasm using the Casper CLI or JavaScript SDK.

The official Casper docs describe Rust/Wasm smart contracts, Casper Testnet funding, installing contracts, and JavaScript SDK usage.
