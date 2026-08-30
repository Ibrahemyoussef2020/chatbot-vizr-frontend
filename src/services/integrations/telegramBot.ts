import api from "@/api";

export interface TelegramBotItem {
    id: string;
    bot_token: string;
    bot_name: string;
    bot_username: string;
    ai_engine_type: "internal_server" | "openai_api";
    internal_server_url?: string;
    openai_api_key?: string;
    status: "active" | "error" | "pending";
    last_activity_at: string;
    error_message?: string;
    system: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface TelegramWebhookResult {
    success: boolean;
    webhook_url: string;
}

export interface TelegramTestResult {
    sent: boolean;
    chat_id: string;
    text?: string;
    bot_username: string;
    routed_via_ai_engine: string;
    timestamp: string;
}

export const fetchTelegramBots = async (systemSlug?: string): Promise<TelegramBotItem[]> => {
    const res = await api.get("/admin/telegram/bots", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const createTelegramBot = async (payload: {
    system_id: string;
    bot_token: string;
    ai_engine_type?: "internal_server" | "openai_api";
    internal_server_url?: string;
    openai_api_key?: string;
}): Promise<TelegramBotItem> => {
    const res = await api.post("/admin/telegram/bots", payload);
    return res.data.data;
};

export const refreshTelegramWebhook = async (botId: string): Promise<TelegramWebhookResult> => {
    const res = await api.post(`/admin/telegram/bots/${botId}/webhook`);
    return res.data.data;
};

export const deleteTelegramBot = async (botId: string): Promise<boolean> => {
    await api.delete(`/admin/telegram/bots/${botId}`);
    return true;
};

export const sendTelegramTestMessage = async (
    botId: string,
    chatId: string,
    text?: string,
): Promise<TelegramTestResult> => {
    const res = await api.post(`/admin/telegram/bots/${botId}/test-message`, { chat_id: chatId, text });
    return res.data.data;
};
