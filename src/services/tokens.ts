import api from "@/api";

export interface OverallTotals {
    grand_total_input: number;
    grand_total_output: number;
    grand_total_all: number;
    grand_total_requests: number;
    total_cost_usd: number;
}

export interface SourceStats {
    input: number;
    output: number;
    total: number;
    requests: number;
    costUSD: number;
}

export interface ExternalVsInternal {
    external_api: SourceStats;
    internal_agent: SourceStats;
}

export interface AgentBreakdownItem {
    agentName: string;
    sourceType: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    requests: number;
    costUSD: number;
}

export interface ModelCostItem {
    model: string;
    provider: string;
    total_tokens: number;
    costUSD: number;
    requests: number;
    avgLatencyMs: number;
    tokensPerSec: number;
}

export interface PerformanceMetrics {
    avgLatencyMs: number;
    avgTokensPerSec: number;
    successRate: number;
    fallbackRate: number;
    costPerThousand: number;
}

export interface ApiKeyTotals {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    requests: number;
    unique_threads_count: number;
}

export interface MetricsPerApiKeyItem {
    provider: string;
    totals: ApiKeyTotals;
}

export interface ThreadAgentItem {
    api_key_id: string;
    provider: string;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    requests: number;
    sourceType?: string;
    agentName?: string;
}

export interface TokenAnalyticsData {
    overall_totals: OverallTotals;
    external_vs_internal: ExternalVsInternal;
    agent_breakdown: AgentBreakdownItem[];
    model_cost_breakdown: ModelCostItem[];
    performance_metrics: PerformanceMetrics;
    metrics_per_api_key: Record<string, MetricsPerApiKeyItem>;
    metrics_per_thread: Record<string, ThreadAgentItem[]>;
}

export interface TokenLogRecord {
    id: string;
    apiKeyId: string;
    threadId: string;
    sourceType?: string;
    agentName?: string;
    model: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    durationMs: number;
    costUSD: number;
    status: string;
    createdAt: string;
}

export interface TokenLogsResponse {
    apiKeyId: string;
    logs: TokenLogRecord[];
    total_log_records: number;
    limit: number;
    skip: number;
}

export const fetchTokenAnalytics = async (systemSlug?: string) => {
    const response = await api.get("/admin/analytics/tokens", {
        params: { system_slug: systemSlug },
    });
    return response.data.data as TokenAnalyticsData;
};

export const fetchTokenLogsForApiKey = async (apiKeyId: string, limit = 50, skip = 0) => {
    const response = await api.get(`/admin/analytics/tokens/logs/${apiKeyId}`, {
        params: { limit, skip },
    });
    return response.data.data as TokenLogsResponse;
};
