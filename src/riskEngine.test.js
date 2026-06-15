import test from "node:test";
import assert from "node:assert/strict";
import { exampleActions, reviewAction, stableStringify } from "./riskEngine.js";

if (!globalThis.crypto?.subtle) {
  const { webcrypto } = await import("node:crypto");
  globalThis.crypto = webcrypto;
}

test("stableStringify sorts object keys", () => {
  assert.equal(stableStringify({ b: 1, a: 2 }), '{"a":2,"b":1}');
});

test("safe DeFi example is approved or sent to human confirmation with low risk", async () => {
  const review = await reviewAction(exampleActions.defi);
  assert.ok(review.risk_score < 35);
  assert.equal(review.decision, "APPROVE");
  assert.match(review.review_hash, /^0x[a-f0-9]{64}$/);
});

test("unsafe example is blocked", async () => {
  const review = await reviewAction(exampleActions.unsafe);
  assert.equal(review.decision, "BLOCK");
  assert.ok(review.risk_score >= 70);
  assert.ok(review.missing_information.length >= 4);
});
