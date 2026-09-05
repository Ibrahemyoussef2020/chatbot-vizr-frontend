import api from "@/api";
export interface AIProviderItem { id: string; code: string; name: string; enabled: boolean; configured: boolean; priority: number; health: string; last_error: string; }
export interface AIOverview { providers: number; models: number; agents: number; requests: number; success_rate: number; total_tokens: number; average_latency_ms: number; fallback_attempts: number; }
const params = (systemSlug?: string) => ({ system_slug: systemSlug });
export const fetchAIOverview = async (systemSlug?: string): Promise<AIOverview> => (await api.get("/admin/ai-management/overview", { params: params(systemSlug) })).data.data;
export const fetchAIProviders = async (): Promise<AIProviderItem[]> => (await api.get("/admin/ai-management/providers")).data.data;
export const updateAIProvider = async (id: string, payload: Partial<AIProviderItem>): Promise<AIProviderItem> => (await api.patch(`/admin/ai-management/providers/${id}`, payload)).data.data;
export const fetchAIModels = async () => (await api.get("/admin/ai-management/models")).data.data;
export const createAIModel = async (payload: any) => (await api.post("/admin/ai-management/models", payload)).data.data;
export const updateAIModel = async (id: string, payload: any) => (await api.patch(`/admin/ai-management/models/${id}`, payload)).data.data;
export const deleteAIModel = async (id: string) => (await api.delete(`/admin/ai-management/models/${id}`)).data.data;
export const fetchAIAgents = async (systemSlug?: string) => (await api.get("/admin/ai-management/agents", { params: params(systemSlug) })).data.data;
export const createAIAgent = async (payload: any, systemSlug?: string) => (await api.post("/admin/ai-management/agents", payload, { params: params(systemSlug) })).data.data;
export const updateAIAgent = async (id: string, payload: any, systemSlug?: string) => (await api.patch(`/admin/ai-management/agents/${id}`, payload, { params: params(systemSlug) })).data.data;
export const deleteAIAgent = async (id: string, systemSlug?: string) => (await api.delete(`/admin/ai-management/agents/${id}`, { params: params(systemSlug) })).data.data;
export const fetchAIRequestLogs = async (systemSlug?: string) => (await api.get("/admin/ai-management/logs", { params: params(systemSlug) })).data.data;
export const fetchAIRouting = async (systemSlug?: string) => (await api.get("/admin/ai-management/routing", { params: params(systemSlug) })).data.data;
export const fetchAIQuotas = async (systemSlug?: string) => (await api.get("/admin/ai-management/quotas", { params: params(systemSlug) })).data.data;
export const createAIRouting = async (payload: any, systemSlug?: string) => (await api.post("/admin/ai-management/routing", payload, { params: params(systemSlug) })).data.data;
export const updateAIRouting = async (id: string, payload: any, systemSlug?: string) => (await api.patch(`/admin/ai-management/routing/${id}`, payload, { params: params(systemSlug) })).data.data;
export const deleteAIRouting = async (id: string, systemSlug?: string) => (await api.delete(`/admin/ai-management/routing/${id}`, { params: params(systemSlug) })).data.data;
export const createAIQuota = async (payload: any, systemSlug?: string) => (await api.post("/admin/ai-management/quotas", payload, { params: params(systemSlug) })).data.data;
export const updateAIQuota = async (id: string, payload: any, systemSlug?: string) => (await api.patch(`/admin/ai-management/quotas/${id}`, payload, { params: params(systemSlug) })).data.data;
export const deleteAIQuota = async (id: string, systemSlug?: string) => (await api.delete(`/admin/ai-management/quotas/${id}`, { params: params(systemSlug) })).data.data;
export const fetchAIAnalytics = async (systemSlug?: string) => (await api.get("/admin/ai-management/analytics", { params: params(systemSlug) })).data.data;
