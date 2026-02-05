import { useEffect, useMemo, useState } from "react";
import { api, AlertRequest, CostSimulationRequest, CostSimulationResult, Metric, Recommendation } from "./api";

type Tab = "dashboard" | "metrics" | "recommendations" | "cost" | "alerts";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function classNames(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const order: Tab[] = ["dashboard", "metrics", "recommendations", "cost", "alerts"];
  const [resourceId, setResourceId] = useState("ec2-123");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<unknown>(null);

  const [metricDraft, setMetricDraft] = useState<Metric>({
    resourceId: "ec2-123",
    cpu: 12.4,
    memory: 30.2,
    disk: 40.1
  });

  const [analyzeDraft, setAnalyzeDraft] = useState<{ avgCpu: number; avgMemory: number; idleHours: number }>({
    avgCpu: 10,
    avgMemory: 50,
    idleHours: 10
  });

  const [costDraft, setCostDraft] = useState<CostSimulationRequest>({
    currentInstanceType: "t2.medium",
    recommendedInstanceType: "t2.small",
    action: "DOWNSCALE"
  });

  const [alertDraft, setAlertDraft] = useState<AlertRequest>({
    recipient: "test@example.com",
    message: "hello",
    severity: "LOW"
  });

  const serviceHealth = useMemo(() => {
    if (error) return { label: "Needs attention", kind: "bad" as const };
    return { label: busy ? "Working..." : "Ready", kind: busy ? ("warn" as const) : ("ok" as const) };
  }, [busy, error]);

  const [authRaw, setAuthRaw] = useState("admin:admin123");
  const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem("auth"));
  const [maxIndex, setMaxIndex] = useState<number>(!!localStorage.getItem("auth") ? 0 : -1);
  const [resources, setResources] = useState<string[]>([]);
  const [latestRec, setLatestRec] = useState<Recommendation | null>(null);
  const [savingsSummary, setSavingsSummary] = useState<{ totalSavings: number } | null>(null);
  const [alertSuccess, setAlertSuccess] = useState(false);

  function isPlainObject(x: unknown): x is Record<string, unknown> {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }



  function isMetricArray(x: unknown): x is Metric[] {
    return Array.isArray(x) && x.every((i) => isPlainObject(i) && "cpu" in (i as any) && "memory" in (i as any) && "disk" in (i as any));
  }

  function isMetric(x: unknown): x is Metric {
    return isPlainObject(x) && "cpu" in (x as any) && "memory" in (x as any) && "disk" in (x as any) && "resourceId" in (x as any);
  }

  function isRecommendationArray(x: unknown): x is Recommendation[] {
    return Array.isArray(x) && x.every((i) => isPlainObject(i) && "recommendationType" in (i as any) && "description" in (i as any));
  }

  function renderMetricsList() {
    if (error) return <div style={{ color: "var(--danger)", fontWeight: 700 }}>{error}</div>;
    const data = lastResult;
    if (isMetric(data)) {
      const m = data;
      return (
        <div className="card col-12" style={{ padding: 12 }}>
          <div className="row">
            <div>
              <div className="muted">Resource</div>
              <div style={{ fontWeight: 700 }}>{m.resourceId}</div>
            </div>
            <div>
              <div className="muted">CPU (%)</div>
              <div style={{ fontWeight: 700, color: "var(--success)" }}>{m.cpu}</div>
            </div>
            <div>
              <div className="muted">Memory (%)</div>
              <div style={{ fontWeight: 700, color: "var(--success)" }}>{m.memory}</div>
            </div>
            <div>
              <div className="muted">Disk (%)</div>
              <div style={{ fontWeight: 700, color: "var(--success)" }}>{m.disk}</div>
            </div>
            <div>
              <div className="muted">Time</div>
              <div style={{ fontWeight: 700 }}>{m.timestamp ?? ""}</div>
            </div>
          </div>
        </div>
      );
    }
    if (!isMetricArray(data) || data.length === 0) {
      return <div className="muted">No metrics found</div>;
    }
    return (
      <div className="grid">
        {data.slice(0, 10).map((m, idx) => (
          <div key={idx} className="card col-12" style={{ padding: 12 }}>
            <div className="row">
              <div>
                <div className="muted">Resource</div>
                <div style={{ fontWeight: 700 }}>{m.resourceId}</div>
              </div>
              <div>
                <div className="muted">CPU (%)</div>
                <div style={{ fontWeight: 700, color: "var(--success)" }}>{m.cpu}</div>
              </div>
              <div>
                <div className="muted">Memory (%)</div>
                <div style={{ fontWeight: 700, color: "var(--success)" }}>{m.memory}</div>
              </div>
              <div>
                <div className="muted">Disk (%)</div>
                <div style={{ fontWeight: 700, color: "var(--success)" }}>{m.disk}</div>
              </div>
              <div>
                <div className="muted">Time</div>
                <div style={{ fontWeight: 700 }}>{m.timestamp ?? ""}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderRecommendationsList() {
    if (error) return <div style={{ color: "var(--danger)", fontWeight: 700 }}>{error}</div>;
    const data = lastResult;
    if (isRecommendationArray(data) && data.length > 0) {
      return (
        <div className="grid">
          {data.slice(0, 10).map((r, idx) => (
            <div key={idx} className="card col-12" style={{ padding: 12 }}>
              <div className="row">
                <div>
                  <div className="muted">Type</div>
                  <div style={{ fontWeight: 800 }}>{r.recommendationType}</div>
                </div>
                <div>
                  <div className="muted">Confidence</div>
                  <div style={{ fontWeight: 700 }}>{(r.confidence ?? 0).toFixed(2)}</div>
                </div>
              </div>
              <div style={{ height: 8 }} />
              <div className="muted">{r.description}</div>
            </div>
          ))}
        </div>
      );
    }
    if (isPlainObject(data) && "recommendationType" in (data as any)) {
      const r = data as Recommendation;
      return (
        <div className="card" style={{ padding: 12 }}>
          <div className="row">
            <div>
              <div className="muted">Type</div>
              <div style={{ fontWeight: 800 }}>{r.recommendationType}</div>
            </div>
            <div>
              <div className="muted">Confidence</div>
              <div style={{ fontWeight: 700 }}>{(r.confidence ?? 0).toFixed(2)}</div>
            </div>
          </div>
          <div style={{ height: 8 }} />
          <div className="muted">{r.description}</div>
        </div>
      );
    }
    return <div className="muted">No recommendations available</div>;
  }

  function isCompareArray(x: unknown): x is Array<{ recommendedInstanceType: string; result: CostSimulationResult }> {
    return (
      Array.isArray(x) &&
      x.every(
        (i) =>
          isPlainObject(i) &&
          "recommendedInstanceType" in (i as any) &&
          isPlainObject((i as any).result) &&
          "monthlySavings" in (i as any).result
      )
    );
  }

  function renderCompareList() {
    if (error) return <div style={{ color: "var(--danger)", fontWeight: 700 }}>{error}</div>;
    const data = lastResult;
    if (!isCompareArray(data) || data.length === 0) return null;
    const sorted = [...data].sort((a, b) => (b.result.monthlySavings ?? 0) - (a.result.monthlySavings ?? 0)).slice(0, 5);
    return (
      <div className="grid">
        {sorted.map((item, idx) => (
          <div key={idx} className="card col-12" style={{ padding: 12 }}>
            <div className="row">
              <div>
                <div className="muted">Instance Type</div>
                <div style={{ fontWeight: 700 }}>{item.recommendedInstanceType}</div>
              </div>
              <div>
                <div className="muted">Current Monthly</div>
                <div style={{ fontWeight: 700 }}>{formatMoney(item.result.currentMonthlyCost)}</div>
              </div>
              <div>
                <div className="muted">Projected Monthly</div>
                <div style={{ fontWeight: 700 }}>{formatMoney(item.result.projectedMonthlyCost)}</div>
              </div>
              <div>
                <div className="muted">Monthly Savings</div>
                <div style={{ fontWeight: 700, color: "var(--success)" }}>{formatMoney(item.result.monthlySavings)}</div>
              </div>
              <div>
                <div className="muted">Savings %</div>
                <div style={{ fontWeight: 700 }}>{(item.result.savingsPercentage ?? 0).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      const result = await fn();
      setLastResult(result ?? null);
      return result;
    } catch (e) {
      let message = e instanceof Error ? e.message : "Request failed";
      if (message === "Failed to fetch") {
        message = "Service is unavailable. Please try again later.";
      }
      setError(message);
      setLastResult({ error: message });
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function loadMetrics() {
    await run(() => api.getMetrics(resourceId));
    const nextIdx = order.indexOf("recommendations");
    setMaxIndex((i) => Math.max(i, nextIdx));
    setTab("recommendations");
  }

  async function sendMetric() {
    await run(() => api.collectMetric({ ...metricDraft, resourceId: metricDraft.resourceId || resourceId }));
    const nextIdx = order.indexOf("recommendations");
    setMaxIndex((i) => Math.max(i, nextIdx));
    setTab("recommendations");
  }

  async function loadRecommendations() {
    await run(() => api.getRecommendations(resourceId));
    const nextIdx = order.indexOf("cost");
    setMaxIndex((i) => Math.max(i, nextIdx));
    setTab("cost");
  }

  async function analyze() {
    await run(() =>
      api.analyzeUsage({
        resourceId,
        avgCpu: Number.isFinite(analyzeDraft.avgCpu) ? analyzeDraft.avgCpu : undefined,
        avgMemory: Number.isFinite(analyzeDraft.avgMemory) ? analyzeDraft.avgMemory : undefined,
        idleHours: Number.isFinite(analyzeDraft.idleHours) ? analyzeDraft.idleHours : undefined
      })
    );
    const nextIdx = order.indexOf("cost");
    setMaxIndex((i) => Math.max(i, nextIdx));
    setTab("cost");
  }

  async function simulateCost() {
    await run(() => api.simulateCost(costDraft));
    const nextIdx = order.indexOf("alerts");
    setMaxIndex((i) => Math.max(i, nextIdx));
    setTab("alerts");
  }

  async function compareWhatIf() {
    const candidates = ["t2.micro", "t2.small", "t2.medium", "m5.large", "m5.xlarge"];
    await run(() => api.costWhatIf(costDraft.currentInstanceType, candidates, costDraft.action));
  }

  async function sendAlert() {
    setAlertSuccess(false);
    await run(() => api.sendAlert(alertDraft));
    setAlertSuccess(true);
  }

  async function loadDashboard() {
    try {
      const [rs, rec, sum] = await Promise.all([api.getResources(), api.getLatestRecommendation(), api.getSavingsSummary()]);
      setResources(rs ?? []);
      setLatestRec(rec ?? null);
      setSavingsSummary(sum ?? null);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (authed && tab === "dashboard") {
      loadDashboard();
    }
  }, [authed, tab]);

  useEffect(() => {
    if (authed) {
      setMaxIndex((i) => Math.max(i, order.indexOf("dashboard")));
    } else {
      setMaxIndex(-1);
    }
  }, [authed]);

  function canGo(t: Tab) {
    return authed && order.indexOf(t) <= maxIndex;
  }

  function renderBody() {
    if (!authed) {
      return (
        <div className="grid">
          <div className="card col-6">
            <div className="title">Login</div>
            <div className="sub">Basic Authentication</div>
            <div style={{ height: 12 }} />
            <div className="row">
              <div>
                <label>Username</label>
                <input placeholder="admin" value={authRaw.split(":")[0] ?? ""} onChange={(e) => setAuthRaw(`${e.target.value}:${authRaw.split(":")[1] ?? ""}`)} />
              </div>
              <div>
                <label>Password</label>
                <input type="password" placeholder="admin123" value={authRaw.split(":")[1] ?? ""} onChange={(e) => setAuthRaw(`${authRaw.split(":")[0] ?? ""}:${e.target.value}`)} />
              </div>
            </div>
            <div style={{ height: 12 }} />
          <div className="actions">
              <button
                className={classNames("btn", "btnPrimary")}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    localStorage.setItem("auth", authRaw);
                    await api.getSavingsSummary();
                    setAuthed(true);
                    setTab("dashboard");
                    setMaxIndex(order.indexOf("dashboard"));
                  } catch (e) {
                    localStorage.removeItem("auth");
                    setAuthed(false);
                    setError("Invalid username or password");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Login
              </button>
            </div>
            {error ? <div style={{ height: 12 }} /> : null}
            {error ? <div style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</div> : null}
          </div>
          <div className="card col-6">
            <div className="title">Welcome</div>
            <div className="sub">After login, access the Dashboard</div>
            <div style={{ height: 12 }} />
            <div className="muted">Use the Dashboard to navigate Metrics, Recommendations, Cost Simulation, and Alerts.</div>
          </div>
        </div>
      );
    }

    if (tab === "dashboard") {
      return (
        <div className="grid">
          <div className="card col-4">
            <div className="title">Total Resources Monitored</div>
            <div className="sub">Distinct resource IDs</div>
            <div style={{ height: 12 }} />
            <div style={{ fontSize: 28, fontWeight: 800 }}>{resources.length}</div>
          </div>
          <div className="card col-4">
            <div className="title">Last Optimization Status</div>
            <div className="sub">Latest recommendation</div>
            <div style={{ height: 12 }} />
            {latestRec ? (
              <div>
                <div>{latestRec.recommendationType}</div>
                <div className="muted">{latestRec.description}</div>
                <div className="muted">Confidence: {(latestRec.confidence ?? 0).toFixed(2)}</div>
              </div>
            ) : (
              <div className="muted">No recommendations yet</div>
            )}
          </div>
          <div className="card col-4">
            <div className="title">Monthly Savings Summary</div>
            <div className="sub">Last 30 days</div>
            <div style={{ height: 12 }} />
            <div style={{ fontSize: 24, fontWeight: 800 }}>{formatMoney(savingsSummary?.totalSavings ?? 0)}</div>
          </div>
          <div className="card col-12">
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button
                className={classNames("btn", "btnPrimary")}
                onClick={() => {
                  const idx = order.indexOf("metrics");
                  setMaxIndex((i) => Math.max(i, idx));
                  setTab("metrics");
                }}
              >
                Continue to Metrics
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (tab === "metrics") {
      return (
        <div className="grid">
          <div className="card col-6">
            <div className="title">Collect Metric</div>
            <div style={{ height: 12 }} />
            <div className="row">
              <div>
                <label>Resource ID</label>
                <input value={metricDraft.resourceId} onChange={(e) => setMetricDraft((p) => ({ ...p, resourceId: e.target.value }))} />
              </div>
              <div>
                <label>CPU (%)</label>
                <input
                  type="number"
                  value={metricDraft.cpu}
                  onChange={(e) => setMetricDraft((p) => ({ ...p, cpu: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label>Memory (%)</label>
                <input
                  type="number"
                  value={metricDraft.memory}
                  onChange={(e) => setMetricDraft((p) => ({ ...p, memory: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label>Disk (%)</label>
                <input
                  type="number"
                  value={metricDraft.disk}
                  onChange={(e) => setMetricDraft((p) => ({ ...p, disk: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className="actions">
              <button className={classNames("btn", "btnPrimary")} disabled={busy} onClick={sendMetric}>
                Send Metric
              </button>
            </div>
            <div style={{ height: 12 }} />
            <div className="muted">Tip: after sending, use “Load Metrics” to confirm it was stored.</div>
            {isMetric(lastResult) ? <div style={{ height: 12 }} /> : null}
            {isMetric(lastResult) ? <div style={{ color: "var(--success)", fontWeight: 700 }}>Metric recorded</div> : null}
          </div>

          <div className="card col-6">
            <div className="title">Metrics Viewer</div>
            <div style={{ height: 12 }} />
            <div className="row">
              <div>
                <label>Resource ID</label>
                <input value={resourceId} onChange={(e) => setResourceId(e.target.value)} />
              </div>
              <div style={{ display: "flex", alignItems: "end" }}>
                <button className={classNames("btn", "btnPrimary")} disabled={busy} onClick={loadMetrics}>
                  Load Metrics
                </button>
              </div>
            </div>
            <div style={{ height: 12 }} />
            {renderMetricsList()}
          </div>
        </div>
      );
    }

    if (tab === "recommendations") {
      return (
        <div className="grid">
          <div className="card col-6">
            <div className="title">Analyze Usage</div>
            <div style={{ height: 12 }} />
            <div className="row">
              <div>
                <label>Resource ID</label>
                <input value={resourceId} onChange={(e) => setResourceId(e.target.value)} />
              </div>
              <div>
                <label>Avg CPU (%)</label>
                <input type="number" value={analyzeDraft.avgCpu} onChange={(e) => setAnalyzeDraft((p) => ({ ...p, avgCpu: Number(e.target.value) }))} />
              </div>
              <div>
                <label>Avg Memory (%)</label>
                <input
                  type="number"
                  value={analyzeDraft.avgMemory}
                  onChange={(e) => setAnalyzeDraft((p) => ({ ...p, avgMemory: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label>Idle Hours</label>
                <input
                  type="number"
                  value={analyzeDraft.idleHours}
                  onChange={(e) => setAnalyzeDraft((p) => ({ ...p, idleHours: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div style={{ height: 12 }} />
            <div className="actions">
              <button className={classNames("btn", "btnPrimary")} disabled={busy} onClick={analyze}>
                Generate Recommendation
              </button>
            </div>
          </div>

          <div className="card col-6">
            <div className="title">Recommendations</div>
            <div style={{ height: 12 }} />
            <div className="actions">
              <button className={classNames("btn", "btnPrimary")} disabled={busy} onClick={loadRecommendations}>
                Load Recommendations
              </button>
            </div>
            <div style={{ height: 12 }} />
            {renderRecommendationsList()}
          </div>
        </div>
      );
    }

    if (tab === "cost") {
      const result = lastResult as CostSimulationResult | null;
      return (
        <div className="grid">
          <div className="card col-6">
            <div className="title">Cost Simulation</div>
            <div style={{ height: 12 }} />
            <div className="row">
              <div>
                <label>Action</label>
                <select value={costDraft.action} onChange={(e) => setCostDraft((p) => ({ ...p, action: e.target.value }))}>
                  <option value="DOWNSCALE">DOWNSCALE</option>
                  <option value="UPSCALE">UPSCALE</option>
                  <option value="TERMINATE">TERMINATE</option>
                </select>
              </div>
              <div>
                <label>Current Instance Type</label>
                <select value={costDraft.currentInstanceType} onChange={(e) => setCostDraft((p) => ({ ...p, currentInstanceType: e.target.value }))}>
                  <option value="t2.micro">t2.micro</option>
                  <option value="t2.small">t2.small</option>
                  <option value="t2.medium">t2.medium</option>
                  <option value="m5.large">m5.large</option>
                  <option value="m5.xlarge">m5.xlarge</option>
                </select>
              </div>
              <div>
                <label>Recommended Instance Type</label>
                <select
                  value={costDraft.recommendedInstanceType}
                  onChange={(e) => setCostDraft((p) => ({ ...p, recommendedInstanceType: e.target.value }))}
                  disabled={costDraft.action === "TERMINATE"}
                >
                  <option value="t2.micro">t2.micro</option>
                  <option value="t2.small">t2.small</option>
                  <option value="t2.medium">t2.medium</option>
                  <option value="m5.large">m5.large</option>
                  <option value="m5.xlarge">m5.xlarge</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "end" }}>
                <button className={classNames("btn", "btnPrimary")} disabled={busy} onClick={simulateCost}>
                  Simulate
                </button>
                <div style={{ width: 12 }} />
                <button className={classNames("btn")} disabled={busy} onClick={compareWhatIf}>
                  Compare Types
                </button>
              </div>
              </div>
              <div style={{ height: 12 }} />
              {!error && result ? <div style={{ color: "var(--success)", fontWeight: 700 }}>Simulation completed</div> : null}
              {error ? <div style={{ color: "var(--danger)", fontWeight: 700 }}>{error}</div> : null}
          </div>

          <div className="card col-6">
            <div className="title">Summary</div>
            <div className="sub">Monthly costs and savings estimate</div>
            <div style={{ height: 12 }} />
            {result && typeof result.currentMonthlyCost === "number" ? (
              <div className="grid">
                <div className="card col-12">
                  <div className="row">
                    <div>
                      <div className="muted">Current Monthly Cost</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{formatMoney(result.currentMonthlyCost)}</div>
                    </div>
                    <div>
                      <div className="muted">Projected Monthly Cost</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{formatMoney(result.projectedMonthlyCost)}</div>
                    </div>
                  </div>
                  <div style={{ height: 10 }} />
                  <div className="row">
                    <div>
                      <div className="muted">Monthly Savings</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{formatMoney(result.monthlySavings)}</div>
                    </div>
                    <div>
                      <div className="muted">Savings %</div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{result.savingsPercentage.toFixed(2)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="muted">Run a simulation to see the summary.</div>
            )}
          </div>
          <div className="card col-12">
            <div className="title">Compare Results</div>
            <div className="sub">Top savings candidates</div>
            <div style={{ height: 12 }} />
            {renderCompareList()}
          </div>
        </div>
      );
    }

    return (
      <div className="grid">
        <div className="card col-6">
          <div className="title">Send Alert</div>
          <div style={{ height: 12 }} />
          <div className="row">
            <div>
              <label>Recipient</label>
              <input value={alertDraft.recipient} onChange={(e) => setAlertDraft((p) => ({ ...p, recipient: e.target.value }))} />
            </div>
            <div>
              <label>Severity</label>
              <select value={alertDraft.severity} onChange={(e) => setAlertDraft((p) => ({ ...p, severity: e.target.value }))}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div>
            <label>Message</label>
            <textarea value={alertDraft.message} onChange={(e) => setAlertDraft((p) => ({ ...p, message: e.target.value }))} />
          </div>
          <div style={{ height: 12 }} />
          <div className="actions">
            <button className={classNames("btn", "btnPrimary")} disabled={busy} onClick={sendAlert}>
              Send
            </button>
          </div>
        </div>

        <div className="card col-6">
          <div style={{ height: 12 }} />
          {alertSuccess && !error ? <div style={{ color: "var(--success)", fontWeight: 700 }}>🟢 Alert sent successfully</div> : null}
          {error ? <div style={{ color: "var(--danger)", fontWeight: 700 }}>{error}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Cloud Optimizer Dashboard</div>
          <div className="sub">Metrics, recommendations, cost simulation, and alerts</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className={classNames("pill", serviceHealth.kind === "ok" && "ok", serviceHealth.kind === "warn" && "warn", serviceHealth.kind === "bad" && "bad")}>
            <span>{serviceHealth.label}</span>
            {error ? <span style={{ opacity: 0.8 }}>{error}</span> : null}
          </div>
          {authed ? (
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem("auth");
                setAuthed(false);
                setTab("dashboard");
                setMaxIndex(-1);
              }}
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="tabs">
          <button
            className={classNames("tab", tab === "dashboard" && "tabActive")}
            onClick={() => canGo("dashboard") && setTab("dashboard")}
            disabled={!canGo("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={classNames("tab", tab === "metrics" && "tabActive")}
            onClick={() => canGo("metrics") && setTab("metrics")}
            disabled={!canGo("metrics")}
          >
            Metrics
          </button>
          <button
            className={classNames("tab", tab === "recommendations" && "tabActive")}
            onClick={() => canGo("recommendations") && setTab("recommendations")}
            disabled={!canGo("recommendations")}
          >
            Recommendations
          </button>
          <button
            className={classNames("tab", tab === "cost" && "tabActive")}
            onClick={() => canGo("cost") && setTab("cost")}
            disabled={!canGo("cost")}
          >
            Cost
          </button>
          <button
            className={classNames("tab", tab === "alerts" && "tabActive")}
            onClick={() => canGo("alerts") && setTab("alerts")}
            disabled={!canGo("alerts")}
          >
            Alerts
          </button>
          <div style={{ flex: 1 }} />
        </div>
      </div>

      {renderBody()}
    </div>
  );
}
