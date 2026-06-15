import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BadgeCheck,
  Blocks,
  CheckCircle2,
  ClipboardCheck,
  FileJson,
  Gauge,
  Github,
  Link2,
  LockKeyhole,
  RadioTower,
  RotateCw,
  ShieldCheck,
  Sparkles,
  XCircle
} from "lucide-react";
import { exampleActions, reviewAction } from "./riskEngine.js";
import "./styles.css";

const decisionMeta = {
  APPROVE: {
    label: "Approve",
    icon: CheckCircle2,
    tone: "approve",
    summary: "The action can proceed after the review hash is recorded."
  },
  REQUIRE_HUMAN_CONFIRMATION: {
    label: "Human check",
    icon: AlertTriangle,
    tone: "confirm",
    summary: "The agent must pause until a person confirms the unresolved risk."
  },
  BLOCK: {
    label: "Block",
    icon: XCircle,
    tone: "block",
    summary: "The agent should not execute this action."
  }
};

function App() {
  const [scenario, setScenario] = useState("defi");
  const [action, setAction] = useState(exampleActions.defi);
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);

  const failedChecks = useMemo(
    () => review?.evidence.filter((item) => item.status === "fail") ?? [],
    [review]
  );

  async function runReview(nextAction = action) {
    setBusy(true);
    const result = await reviewAction(nextAction);
    await new Promise((resolve) => setTimeout(resolve, 360));
    setReview(result);
    setBusy(false);
  }

  function selectScenario(key) {
    setScenario(key);
    const next = exampleActions[key];
    setAction(next);
    setReview(null);
  }

  function updateField(field, value) {
    setAction((current) => ({ ...current, [field]: value }));
    setReview(null);
  }

  const meta = review ? decisionMeta[review.decision] : null;
  const DecisionIcon = meta?.icon ?? Sparkles;

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="" />
          <div>
            <h1>Casper Agentic Risk Sentinel</h1>
            <p>Pre-execution risk review for AI agents on Casper Testnet</p>
          </div>
        </div>
        <div className="network-pill">
          <RadioTower size={16} />
          Casper Testnet ready
        </div>
      </header>

      <section className="workspace">
        <aside className="left-panel">
          <div className="panel-heading">
            <ShieldCheck size={20} />
            Agent action
          </div>

          <div className="segmented" aria-label="Demo scenarios">
            {Object.entries(exampleActions).map(([key, item]) => (
              <button
                className={scenario === key ? "active" : ""}
                key={key}
                onClick={() => selectScenario(key)}
              >
                {item.title}
              </button>
            ))}
          </div>

          <label>
            Intent
            <textarea
              value={action.intent}
              onChange={(event) => updateField("intent", event.target.value)}
            />
          </label>

          <div className="two-col">
            <label>
              Action type
              <select
                value={action.actionType}
                onChange={(event) => updateField("actionType", event.target.value)}
              >
                <option value="defi_rebalance">defi_rebalance</option>
                <option value="rwa_update">rwa_update</option>
                <option value="defi_transfer">defi_transfer</option>
              </select>
            </label>
            <label>
              Destination
              <input
                value={action.destination}
                onChange={(event) => updateField("destination", event.target.value)}
              />
            </label>
          </div>

          <div className="two-col">
            <label>
              Exposure %
              <input
                type="number"
                value={action.exposurePercent}
                onChange={(event) => updateField("exposurePercent", Number(event.target.value))}
              />
            </label>
            <label>
              Max allowed %
              <input
                type="number"
                value={action.maxExposurePercent}
                onChange={(event) =>
                  updateField("maxExposurePercent", Number(event.target.value))
                }
              />
            </label>
          </div>

          <div className="two-col">
            <label>
              Data age, hours
              <input
                type="number"
                value={action.dataFreshnessHours}
                onChange={(event) =>
                  updateField("dataFreshnessHours", Number(event.target.value))
                }
              />
            </label>
            <label>
              Destination trust
              <select
                value={action.destinationTrust}
                onChange={(event) => updateField("destinationTrust", event.target.value)}
              >
                <option value="known">known</option>
                <option value="unknown">unknown</option>
              </select>
            </label>
          </div>

          <div className="two-col">
            <label>
              Evidence
              <select
                value={action.evidenceLevel}
                onChange={(event) => updateField("evidenceLevel", event.target.value)}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </label>
            <label>
              Protocol health
              <select
                value={action.protocolHealth}
                onChange={(event) => updateField("protocolHealth", event.target.value)}
              >
                <option value="normal">normal</option>
                <option value="degraded">degraded</option>
              </select>
            </label>
          </div>

          <label>
            Human checkpoint
            <select
              value={action.humanConfirmation}
              onChange={(event) => updateField("humanConfirmation", event.target.value)}
            >
              <option value="required">required</option>
              <option value="none">none</option>
            </select>
          </label>

          <button className="primary" onClick={() => runReview()} disabled={busy}>
            {busy ? <RotateCw className="spin" size={18} /> : <ClipboardCheck size={18} />}
            Review before execution
          </button>
        </aside>

        <section className="review-surface">
          <div className={`decision-card ${meta?.tone ?? "idle"}`}>
            <div className="decision-copy">
              <p className="eyebrow">Agent decision</p>
              <h2>{review ? meta.label : "Awaiting review"}</h2>
              <p>{review ? meta.summary : "Run a scenario to create a structured risk record."}</p>
            </div>
            <div className="decision-icon">
              <DecisionIcon size={44} />
            </div>
          </div>

          <div className="metrics">
            <Metric
              icon={Gauge}
              label="Risk score"
              value={review ? `${review.risk_score}/100` : "--"}
            />
            <Metric
              icon={AlertTriangle}
              label="Failed checks"
              value={review ? failedChecks.length : "--"}
            />
            <Metric icon={LockKeyhole} label="Privacy" value="Hash only" />
          </div>

          <div className="review-grid">
            <section className="audit-panel">
              <div className="panel-heading">
                <Blocks size={20} />
                Risk checks
              </div>
              {!review ? (
                <EmptyState />
              ) : (
                <div className="check-list">
                  {review.evidence.map((item) => (
                    <div className={`check-row ${item.status}`} key={item.id}>
                      {item.status === "pass" ? (
                        <BadgeCheck size={18} />
                      ) : (
                        <AlertTriangle size={18} />
                      )}
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.message}</span>
                      </div>
                      <small>{item.weight}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="audit-panel">
              <div className="panel-heading">
                <Link2 size={20} />
                Casper audit record
              </div>
              {!review ? (
                <EmptyState />
              ) : (
                <div className="chain-box">
                  <div>
                    <span>Review hash</span>
                    <code>{review.review_hash}</code>
                  </div>
                  <div>
                    <span>Testnet status</span>
                    <p>{review.casper_testnet_status}</p>
                  </div>
                  <div>
                    <span>On-chain record</span>
                    <p>
                      Store only the review hash, decision label, and action category. The full
                      review stays off-chain.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="json-panel">
            <div className="panel-heading">
              <FileJson size={20} />
              Structured review output
            </div>
            <pre>{review ? JSON.stringify(review, null, 2) : JSON.stringify(action, null, 2)}</pre>
          </section>
        </section>
      </section>

      <footer>
        <span>
          <Github size={16} />
          Open-source demo package
        </span>
        <span>Contract: risk review hash registry</span>
        <span>No private user data stored on-chain</span>
      </footer>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="metric">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyState() {
  return <div className="empty">Run a review to populate this section.</div>;
}

createRoot(document.getElementById("root")).render(<App />);
