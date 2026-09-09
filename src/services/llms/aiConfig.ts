import type { JsonValue } from "@/utils/structuredKnowledge";
import api from "@/api";

export interface AIConfigData {
    structured_knowledge?: { [key: string]: JsonValue };
    id?: string;
    system_id?: string;
    tenant_name?: string;
    company_name: string;
    assistant_name: string;
    contact_email: string;
    website_url: string;
    contact_us_link: string;
    company_description: string;
    tone_instructions: string;
    pricing_instructions: string;
    language_notes: string;
    contact_collection_rules: string;
    actions_data?: Array<{ action: string; link: string; description: string }>;
    uploaded_files?: Array<{ name: string; url: string; size: number }>;
}

export interface AIConfigKnowledgeSource {
    id: string;
    name: string;
    size: number;
    kind: string;
    status: "processing" | "ready" | "failed";
    error_message?: string;
}

export const fetchAIConfig = async (systemSlug?: string): Promise<AIConfigData> => {
    const res = await api.get("/admin/ai-configs", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const saveAIConfig = async (
    systemSlug?: string,
    payload?: Partial<AIConfigData>,
): Promise<AIConfigData> => {
    const res = await api.post("/admin/ai-configs", payload, { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const deleteAIConfig = async (configId: string): Promise<boolean> => {
    await api.delete(`/admin/ai-configs/${configId}`);
    return true;
};

export const fetchAIConfigKnowledgeSources = async (systemSlug?: string): Promise<AIConfigKnowledgeSource[]> =>
    (await api.get("/admin/ai-configs/knowledge/sources", { params: { system_slug: systemSlug } })).data.data;

export const uploadAIConfigKnowledgeSources = async (systemSlug: string | undefined, files: File[]): Promise<AIConfigKnowledgeSource[]> => {
    const body = new FormData();
    files.forEach(file => body.append("files", file));
    return (await api.post("/admin/ai-configs/knowledge/sources", body, {
        params: { system_slug: systemSlug },
        headers: { "Content-Type": "multipart/form-data" },
    })).data.data;
};

export const deleteAIConfigKnowledgeSource = async (systemSlug: string | undefined, id: string) => {
    await api.delete(`/admin/ai-configs/knowledge/sources/${id}`, { params: { system_slug: systemSlug } });
};
