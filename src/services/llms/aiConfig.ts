import api from "@/api";

export interface AIConfigData {
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
