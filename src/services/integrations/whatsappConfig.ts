import api from "@/api";

export interface WhatsAppSession {
    session_id: string;
    status: "connected" | "qr_ready" | "failed" | "disconnected";
    phone?: string;
}

export interface WhatsAppConfigData {
    id?: string;
    workspace_id?: string;
    system_slug?: string;
    provider: "meta" | "openwa";
    ai_engine_type: "internal_server" | "openai_api";
    internal_server_url?: string;
    openai_api_key?: string;
    whatsapp_app_secret?: string;
    whatsapp_phone_number_id?: string;
    whatsapp_verify_token?: string;
    whatsapp_waba_id?: string;
    whatsapp_access_token?: string;
    openwa_api_url?: string;
    openwa_api_key?: string;
    openwa_session_id?: string;
    sessions?: WhatsAppSession[];
    qr_code_url?: string;
}

export interface WhatsAppTestResult {
    sent: boolean;
    phone: string;
    text: string;
    provider: string;
    routed_via_ai_engine: string;
    timestamp: string;
    mode?: "text" | "template";
    template_name?: string;
    message_id?: string;
}

export interface WhatsAppTemplate {
    name: string;
    language: string;
    category: string;
    body: string;
    parameter_count: number;
}

export interface WhatsAppConversationStatus {
    phone: string;
    replied: boolean;
    latest_message: string | null;
    replied_at: string | null;
    window_expires_at: string | null;
}

export interface WhatsAppConnectionStatus {
    connected: boolean;
    reason: string | null;
    code?: number;
    subcode?: number;
}

export const fetchWhatsAppConfig = async (systemSlug?: string): Promise<WhatsAppConfigData> => {
    const res = await api.get("/admin/whatsapp/config", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const fetchWhatsAppTemplates = async (systemSlug?: string): Promise<WhatsAppTemplate[]> => {
    const res = await api.get("/admin/whatsapp/templates", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const fetchWhatsAppConversationStatus = async (
    phone: string,
    systemSlug?: string,
): Promise<WhatsAppConversationStatus> => {
    const res = await api.get("/admin/whatsapp/conversation-status", { params: { phone, system_slug: systemSlug } });
    return res.data.data;
};

export const fetchWhatsAppConnectionStatus = async (systemSlug?: string): Promise<WhatsAppConnectionStatus> => {
    const res = await api.get("/admin/whatsapp/connection-status", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const saveWhatsAppConfig = async (
    systemSlug?: string,
    payload?: Partial<WhatsAppConfigData>,
): Promise<WhatsAppConfigData> => {
    const res = await api.post("/admin/whatsapp/config", payload, { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const fetchOpenWAQR = async (systemSlug?: string): Promise<string> => {
    const res = await api.get("/admin/whatsapp/openwa/qr", { params: { system_slug: systemSlug } });
    return res.data.data.qr_code_url;
};

export const createOpenWASession = async (systemSlug?: string, sessionId?: string): Promise<WhatsAppSession[]> => {
    const res = await api.post("/admin/whatsapp/openwa/sessions", { session_id: sessionId }, { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const deleteOpenWASession = async (systemSlug?: string, sessionId?: string): Promise<WhatsAppSession[]> => {
    const res = await api.delete(`/admin/whatsapp/openwa/sessions/${sessionId}`, { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const sendWhatsAppTestMessage = async (
    phone: string,
    text: string,
    systemSlug?: string,
    mode: "text" | "template" = "template",
    templateName = "hello_world",
    templateLanguage = "en_US",
    templateParameters: string[] = [],
): Promise<WhatsAppTestResult> => {
    const res = await api.post(
        "/admin/whatsapp/test-message",
        { phone, text, mode, template_name: templateName, template_language: templateLanguage, template_parameters: templateParameters },
        { params: { system_slug: systemSlug } },
    );
    return res.data.data;
};
