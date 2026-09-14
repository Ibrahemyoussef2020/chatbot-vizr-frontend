import api from "@/api";

export interface FeatureInput {
    code: string;
    name: string;
    description: string;
    quotas: Record<string, number>;
    agentSlugs: string[];
}
export interface BusinessFeature extends FeatureInput { _id: string }
export interface FeatureOptions {
    metrics: { key: string; label: string; category: string; unit: string; window: string; description: string; enforced: boolean }[];
    agents: { slug: string; name: string }[];
}
export const listFeatures = async (signal?: AbortSignal): Promise<BusinessFeature[]> =>
    (await api.get("/admin/pricings-features", { signal })).data.data;
export const getFeatureOptions = async (signal?: AbortSignal): Promise<FeatureOptions> =>
    (await api.get("/admin/pricings-features/options", { signal })).data.data;
export const saveFeature = async (input: FeatureInput, id?: string): Promise<BusinessFeature> =>
    (id ? await api.put(`/admin/pricings-features/${id}`, input) : await api.post("/admin/pricings-features", input)).data.data;
export const deleteFeature = async (id: string) => { await api.delete(`/admin/pricings-features/${id}`); };
