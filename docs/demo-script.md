# Demo Script

Casper Agentic Risk Sentinel is a pre-execution risk review layer for AI agents on Casper.

In this demo, an agent proposes DeFi and RWA actions. Before execution, the risk engine checks intent clarity, evidence freshness, exposure limits, destination trust, protocol health, and whether a human checkpoint is required.

For a normal DeFi rebalance, the system approves the action and creates a deterministic review hash.

For an RWA risk update, the system checks that evidence is fresh and confidence is high enough before allowing the update.

For an unsafe transfer, the system blocks execution because the destination is unknown, exposure is too high, data is stale, and no human checkpoint is configured.

The Casper audit panel shows the review hash that should be recorded on Casper Testnet. The on-chain contract stores only the review hash, decision, and action category, while the full review remains off-chain to protect user data.

This creates a practical trust layer for agentic AI workflows: agents can move quickly, but their decisions remain explainable and auditable before they touch assets or contracts.
