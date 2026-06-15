const thresholdRules = [
  {
    id: "intent-clarity",
    label: "Intent clarity",
    weight: 14,
    test: (action) => action.intent.trim().length >= 80,
    pass: "Intent is specific enough for agentic execution.",
    fail: "Intent is short or ambiguous for autonomous execution."
  },
  {
    id: "data-freshness",
    label: "Evidence freshness",
    weight: 16,
    test: (action) => Number(action.dataFreshnessHours) <= 24,
    pass: "Evidence is fresh enough for the selected action.",
    fail: "Evidence is stale and should be refreshed before execution."
  },
  {
    id: "exposure-limit",
    label: "Exposure limit",
    weight: 18,
    test: (action) => Number(action.exposurePercent) <= Number(action.maxExposurePercent),
    pass: "Requested exposure is inside the user's configured limit.",
    fail: "Requested exposure exceeds the configured risk limit."
  },
  {
    id: "destination-trust",
    label: "Destination trust",
    weight: 14,
    test: (action) => action.destinationTrust !== "unknown",
    pass: "Destination has at least a known reputation baseline.",
    fail: "Destination is unknown or not yet verified."
  },
  {
    id: "human-check",
    label: "Human checkpoint",
    weight: 12,
    test: (action) => action.humanConfirmation === "required" || Number(action.exposurePercent) < 20,
    pass: "A human checkpoint exists for meaningful exposure.",
    fail: "No human checkpoint is configured for a material action."
  },
  {
    id: "rwa-evidence",
    label: "RWA evidence",
    weight: 11,
    test: (action) => action.actionType !== "rwa_update" || action.evidenceLevel !== "low",
    pass: "RWA evidence level is acceptable for the update.",
    fail: "RWA update has weak evidence quality."
  },
  {
    id: "protocol-health",
    label: "Protocol health",
    weight: 15,
    test: (action) => action.protocolHealth !== "degraded",
    pass: "No degraded protocol health flag is present.",
    fail: "Protocol health is degraded for this action."
  }
];

export const exampleActions = {
  defi: {
    title: "DeFi rebalance review",
    actionType: "defi_rebalance",
    intent:
      "Rebalance a simulated treasury by moving 18% of stable assets into a higher-yield strategy after checking liquidity, slippage, and destination reputation.",
    destination: "Casper DeFi yield vault",
    destinationTrust: "known",
    exposurePercent: 18,
    maxExposurePercent: 25,
    dataFreshnessHours: 3,
    evidenceLevel: "medium",
    protocolHealth: "normal",
    humanConfirmation: "required"
  },
  rwa: {
    title: "RWA risk update",
    actionType: "rwa_update",
    intent:
      "Publish a real-world asset risk update only after verifying source freshness, confidence level, and whether the change should be marked as low, medium, or high confidence.",
    destination: "RWA disclosure registry",
    destinationTrust: "known",
    exposurePercent: 0,
    maxExposurePercent: 10,
    dataFreshnessHours: 8,
    evidenceLevel: "high",
    protocolHealth: "normal",
    humanConfirmation: "required"
  },
  unsafe: {
    title: "Unsafe agent action",
    actionType: "defi_transfer",
    intent: "Move funds to a new address quickly.",
    destination: "Unknown address",
    destinationTrust: "unknown",
    exposurePercent: 42,
    maxExposurePercent: 20,
    dataFreshnessHours: 72,
    evidenceLevel: "low",
    protocolHealth: "degraded",
    humanConfirmation: "none"
  }
};

export async function reviewAction(action) {
  const failed = [];
  const passed = [];
  let riskScore = 0;

  for (const rule of thresholdRules) {
    const ok = rule.test(action);
    const result = {
      id: rule.id,
      label: rule.label,
      weight: rule.weight,
      status: ok ? "pass" : "fail",
      message: ok ? rule.pass : rule.fail
    };
    if (ok) {
      passed.push(result);
    } else {
      failed.push(result);
      riskScore += rule.weight;
    }
  }

  if (Number(action.exposurePercent) >= 35) riskScore += 12;
  if (action.destinationTrust === "unknown") riskScore += 8;
  if (action.actionType === "defi_transfer" && action.humanConfirmation === "none") riskScore += 10;

  riskScore = Math.min(100, riskScore);
  const decision =
    riskScore >= 70 ? "BLOCK" : riskScore >= 35 ? "REQUIRE_HUMAN_CONFIRMATION" : "APPROVE";

  const explanation = buildExplanation(action, decision, riskScore, failed);
  const reviewRecord = {
    review_id: createReviewId(action),
    project: "Casper Agentic Risk Sentinel",
    chain: "Casper Testnet",
    action_type: action.actionType,
    destination: action.destination,
    risk_score: riskScore,
    decision,
    explanation,
    evidence: [...passed, ...failed],
    missing_information: failed.map((item) => item.message),
    created_at: new Date().toISOString()
  };

  reviewRecord.review_hash = await hashRecord(reviewRecord);
  reviewRecord.casper_testnet_status =
    "Ready to submit when a funded Casper Testnet account is configured.";

  return reviewRecord;
}

function buildExplanation(action, decision, riskScore, failed) {
  if (decision === "APPROVE") {
    return `Risk score ${riskScore}. The proposed ${action.actionType.replaceAll("_", " ")} has clear intent, acceptable exposure, and fresh evidence. The agent can proceed after recording the review hash on Casper Testnet.`;
  }
  if (decision === "REQUIRE_HUMAN_CONFIRMATION") {
    return `Risk score ${riskScore}. The action is not automatically unsafe, but ${failed.length} checks need human review before the agent signs or executes anything.`;
  }
  return `Risk score ${riskScore}. The action should be blocked because key safety checks failed before execution. The blocked decision can still be recorded for auditability.`;
}

function createReviewId(action) {
  const compact = `${action.actionType}-${action.destination}-${Date.now()}`;
  return compact.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function hashRecord(record) {
  const cleanRecord = { ...record };
  delete cleanRecord.review_hash;
  const serialized = stableStringify(cleanRecord);
  const data = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return `0x${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
