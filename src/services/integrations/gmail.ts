import api from "@/api";

export interface GmailStatus {
    connected: boolean;
    email?: string;
    status: "active" | "error" | "pending" | "disconnected";
    watch_expiration?: string;
    error_message?: string;
}

const workspaceParams = (systemSlug?: string) => ({ system_slug: systemSlug });

export const fetchGmailStatus = async (systemSlug?: string): Promise<GmailStatus> => {
    const response = await api.get("/admin/gmail/status", { params: workspaceParams(systemSlug) });
    return response.data.data;
};

export const startGmailConnection = async (systemSlug?: string): Promise<string> => {
    const response = await api.get("/admin/gmail/connect", { params: workspaceParams(systemSlug) });
    return response.data.data.authorization_url;
};

export const renewGmailWatch = async (systemSlug?: string) => {
    const response = await api.post("/admin/gmail/watch", undefined, { params: workspaceParams(systemSlug) });
    return response.data.data;
};

export const disconnectGmail = async (systemSlug?: string) => {
    await api.delete("/admin/gmail/disconnect", { params: workspaceParams(systemSlug) });
};

export const sendGmailTestMessage = async (
    systemSlug: string | undefined,
    recipient: string,
    subject: string,
    content: string,
) => {
    const response = await api.post(
        "/admin/gmail/test-message",
        { recipient, subject, content },
        { params: workspaceParams(systemSlug) },
    );
    return response.data.data as { sent: boolean; message_id?: string; thread_id?: string; recipient: string };
};
