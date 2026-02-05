export type Metric = {
  id?: string;
  resourceId: string;
  cpu: number;
  memory: number;
  disk: number;
  timestamp?: string;
};

export type Recommendation = {
  id: number;
  resourceId: string;
  recommendationType: string;
  description: string;
  createdAt: string;
  status: string;
  confidence?: number;
};

export type CostSimulationRequest = {
  currentInstanceType: string;
  recommendedInstanceType: string;
  action: string;
};

export type CostSimulationResult = {
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  monthlySavings: number;
  savingsPercentage: number;
};

export type AlertRequest = {
  recipient: string;
  message: string;
  severity: string;
};

function humanizeMessage(msg: string): string {
  // If it looks like a code (uppercase with underscores), humanize it
  if (/^[A-Z0-9_]+$/.test(msg)) {
    return msg
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  }
  return msg;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(getAuthHeader() ?? {}),
      ...(init?.headers ?? {})
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  let data: any;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // ignore
  }
  if (!response.ok) {
    let message = "Something went wrong. Please try again.";
    if (response.status >= 400 && response.status < 500 && data?.message && typeof data.message === "string") {
      const technicalKeywords = ["Exception", "java.", "at com.", "org.springframework"];
      if (!technicalKeywords.some((k) => data.message.includes(k))) {
        message = humanizeMessage(data.message);
      }
    }
    throw new Error(message);
  }
  if (data && typeof data === "object" && "status" in data && "data" in data) {
    return (data as { status: string; data: T }).data;
  }
  return data as T;
}

function getAuthHeader(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const token = btoa(raw);
    return { Authorization: `Basic ${token}` };
  } catch {
    return null;
  }
}

export const api = {
  getResources() {
    return request<string[]>(`/api/metrics/resources`, { method: "GET" });
  },
  getMetrics(resourceId: string) {
    return request<Metric[]>(`/api/metrics/${encodeURIComponent(resourceId)}`, { method: "GET" });
  },
  collectMetric(metric: Metric) {
    return request<Metric>(`/api/metrics/collect`, { method: "POST", body: JSON.stringify(metric) });
  },
  getRecommendations(resourceId: string) {
    return request<Recommendation[]>(`/api/optimize/${encodeURIComponent(resourceId)}`, { method: "GET" });
  },
  analyzeUsage(payload: { resourceId: string; avgCpu?: number; avgMemory?: number; idleHours?: number }) {
    return request<Recommendation | undefined>(`/api/optimize/analyze`, { method: "POST", body: JSON.stringify(payload) });
  },
  getLatestRecommendation() {
    return request<Recommendation | null>(`/api/optimize/latest`, { method: "GET" });
  },
  simulateCost(payload: CostSimulationRequest) {
    return request<CostSimulationResult>(`/api/cost/simulate`, { method: "POST", body: JSON.stringify(payload) });
  },
  costWhatIf(currentInstanceType: string, candidates: string[], action: string) {
    return request<Array<{ recommendedInstanceType: string; result: CostSimulationResult }>>(`/api/cost/whatif`, {
      method: "POST",
      body: JSON.stringify({ currentInstanceType, candidates, action })
    });
  },
  getSavingsSummary() {
    return request<{ totalSavings: number }>(`/api/cost/history/summary`, { method: "GET" });
  },
  sendAlert(payload: AlertRequest) {
    return request<string>(`/api/alerts/send`, { method: "POST", body: JSON.stringify(payload) });
  }
};
