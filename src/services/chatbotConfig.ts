import api from "@/api";

export interface ChatbotConfigData {
    id: string | null;
    name: string;
    slug?: string;
    webhook_url: string;
    rate_limit: number;
    is_active: boolean;
}

export const fetchChatbotConfig = async (systemSlug?: string): Promise<ChatbotConfigData> => {
    const res = await api.get("/admin/chatbot/config", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const updateChatbotConfig = async (
    systemSlug?: string,
    payload?: Partial<ChatbotConfigData>,
): Promise<ChatbotConfigData> => {
    const res = await api.put("/admin/chatbot/config", payload, { params: { system_slug: systemSlug } });
    return res.data.data;
};
