import api from "@/api";
export interface AIEntityReference {
    _id?: string;
    id?: string;
    name?: string;
    displayName?: string;
    externalId?: string;
    code?: string;
    permissions?: string[];
}
export interface AIManagementEntity extends AIEntityReference {
    slug?: string;
    description?: string;
    enabled?: boolean;
    systemPrompt?: string;
    providerId?: AIEntityReference;
    securityRoleId?: AIEntityReference;
    primaryModelId?: AIEntityReference;
    agentId?: AIEntityReference;
    fallbackModelIds?: string[];
    modelIds?: AIEntityReference[];
    channels?: string[];
    tools?: string[];
    temperature?: number;
    maxOutputTokens?: number;
    contextWindow?: number;
    timeoutMs?: number;
    maxRetries?: number;
    priority?: number;
    alias?: string;
    strategy?: string;
    scope?: string;
    scopeId?: string | null;
    period?: string;
    requestLimit?: number;
    tokenLimit?: number;
    concurrencyLimit?: number;
    usedRequests?: number;
    usedTokens?: number;
    resetAt?: string;
    provider?: string;
    model?: string;
    totalTokens?: number;
    latencyMs?: number;
    status?: string;
    health?: string;
    createdAt?: string;
    requestType?: string;
    usageReported?: boolean;
    statusCode?: number;
}
export interface AIAnalytics {
    providers: Array<{ _id: string; requests: number; tokens: number; avgLatencyMs: number; costUsd: number }>;
    daily: Array<{ _id: string; requests: number; tokens: number; failures: number }>;
    statuses: Array<{ _id: string; count: number }>;
}
export interface AIRuntimeSettings {
    defaultAgentId: string | null;
    permissions?: string[];
    roles: Array<{ _id: string; name: string; permissions: string[] }>;
}
export const fetchAIRuntime = async (systemSlug?: string): Promise<AIRuntimeSettings> => {
    const response = await api.get("/admin/ai-management/runtime", { params: { system_slug: systemSlug } });
    return response.data.data;
};
export const updateAIRuntime = async (defaultAgentId: string | null, systemSlug?: string) => {
    const response = await api.patch("/admin/ai-management/runtime", { defaultAgentId }, { params: { system_slug: systemSlug } });
    return response.data.data;
};
export interface AIProviderItem { id: string; code: string; name: string; enabled: boolean; configured: boolean; priority: number; health: string; last_error: string; }
export interface AIOverview { providers: number; models: number; agents: number; requests: number; success_rate: number; total_tokens: number; average_latency_ms: number; fallback_attempts: number; }
const params = (systemSlug?: string) => ({ system_slug: systemSlug });
export const fetchAIOverview = async (systemSlug?: string, source: "runtime" | "demo" = "runtime"): Promise<AIOverview> => (await api.get("/admin/ai-management/overview", { params: { ...params(systemSlug), source } })).data.data;
export const fetchAIProviders = async (): Promise<AIProviderItem[]> => (await api.get("/admin/ai-management/providers")).data.data;
export const updateAIProvider = async (id: string, payload: Partial<AIProviderItem>): Promise<AIProviderItem> => (await api.patch(`/admin/ai-management/providers/${id}`, payload)).data.data;
export const fetchAIModels = async () => (await api.get("/admin/ai-management/models")).data.data;
export const createAIModel = async (payload: Record<string, unknown>) => (await api.post("/admin/ai-management/models", payload)).data.data;
export const updateAIModel = async (id: string, payload: Record<string, unknown>) => (await api.patch(`/admin/ai-management/models/${id}`, payload)).data.data;
export const deleteAIModel = async (id: string) => (await api.delete(`/admin/ai-management/models/${id}`)).data.data;
export const fetchAIAgents = async (systemSlug?: string) => (await api.get("/admin/ai-management/agents", { params: params(systemSlug) })).data.data;
export const createAIAgent = async (payload: Record<string, unknown>, systemSlug?: string) => (await api.post("/admin/ai-management/agents", payload, { params: params(systemSlug) })).data.data;
export const updateAIAgent = async (id: string, payload: Record<string, unknown>, systemSlug?: string) => (await api.patch(`/admin/ai-management/agents/${id}`, payload, { params: params(systemSlug) })).data.data;
export const deleteAIAgent = async (id: string, systemSlug?: string) => (await api.delete(`/admin/ai-management/agents/${id}`, { params: params(systemSlug) })).data.data;
export const fetchAIRequestLogs = async (systemSlug?: string, source: "runtime" | "demo" = "runtime") => (await api.get("/admin/ai-management/logs", { params: { ...params(systemSlug), source } })).data.data;
export const fetchAIRouting = async (systemSlug?: string) => (await api.get("/admin/ai-management/routing", { params: params(systemSlug) })).data.data;
export const fetchAIQuotas = async (systemSlug?: string) => (await api.get("/admin/ai-management/quotas", { params: params(systemSlug) })).data.data;
export const createAIRouting = async (payload: Record<string, unknown>, systemSlug?: string) => (await api.post("/admin/ai-management/routing", payload, { params: params(systemSlug) })).data.data;
export const updateAIRouting = async (id: string, payload: Record<string, unknown>, systemSlug?: string) => (await api.patch(`/admin/ai-management/routing/${id}`, payload, { params: params(systemSlug) })).data.data;
export const deleteAIRouting = async (id: string, systemSlug?: string) => (await api.delete(`/admin/ai-management/routing/${id}`, { params: params(systemSlug) })).data.data;
export const createAIQuota = async (payload: Record<string, unknown>, systemSlug?: string) => (await api.post("/admin/ai-management/quotas", payload, { params: params(systemSlug) })).data.data;
export const updateAIQuota = async (id: string, payload: Record<string, unknown>, systemSlug?: string) => (await api.patch(`/admin/ai-management/quotas/${id}`, payload, { params: params(systemSlug) })).data.data;
export const deleteAIQuota = async (id: string, systemSlug?: string) => (await api.delete(`/admin/ai-management/quotas/${id}`, { params: params(systemSlug) })).data.data;
export const fetchAIAnalytics = async (systemSlug?: string, source: "runtime" | "demo" = "runtime") => (await api.get("/admin/ai-management/analytics", { params: { ...params(systemSlug), source } })).data.data;
