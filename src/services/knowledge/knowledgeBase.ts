import api from "@/api";

export type KnowledgeStatus = "empty" | "processing" | "ready" | "partial" | "failed";

export interface KnowledgeSession {
    id: string;
    title: string;
    status: KnowledgeStatus;
    source_count: number;
    ready_source_count: number;
    total_bytes: number;
    created_at: string;
    updated_at: string;
}

export interface KnowledgeSource {
    id: string;
    name: string;
    kind: "pdf" | "audio" | "video" | "excel" | "text";
    mime_type: string;
    size: number;
    status: "processing" | "ready" | "failed";
    error_message?: string;
    created_at: string;
}

export interface KnowledgeMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    citations: Array<{ sourceId: string; name: string }>;
    created_at: string;
}

export interface KnowledgeSessionDetail {
    session: KnowledgeSession;
    sources: KnowledgeSource[];
    messages: KnowledgeMessage[];
}

export const listSessions = async (systemSlug: string) => {
    const response = await api.get("/admin/knowledge/sessions", { params: { system_slug: systemSlug } });
    return response.data.data as KnowledgeSession[];
};

export const createSession = async (systemSlug: string, title: string) => {
    const response = await api.post("/admin/knowledge/sessions", { system_slug: systemSlug, title });
    return response.data.data as KnowledgeSession;
};

export const getSession = async (systemSlug: string, sessionId: string) => {
    const response = await api.get(`/admin/knowledge/sessions/${sessionId}`, { params: { system_slug: systemSlug } });
    return response.data.data as KnowledgeSessionDetail;
};

export const uploadSources = async (systemSlug: string, sessionId: string, files: File[]) => {
    const form = new FormData();
    form.append("system_slug", systemSlug);
    files.forEach((file) => form.append("files", file));
    const response = await api.post(`/admin/knowledge/sessions/${sessionId}/sources`, form);
    return response.data.data as KnowledgeSessionDetail;
};

export const askQuestion = async (systemSlug: string, sessionId: string, question: string) => {
    const response = await api.post(`/admin/knowledge/sessions/${sessionId}/chat`, { system_slug: systemSlug, question });
    return response.data.data as KnowledgeMessage;
};
