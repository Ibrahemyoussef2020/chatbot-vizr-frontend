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

interface UploadAuthorization {
    duplicate: boolean;
    resumed?: boolean;
    upload_id: string;
    status: string;
    bytes_uploaded: number;
    chunk_size: number;
    expires_at: string;
    cloudinary: {
        uploadUrl: string;
        apiKey: string;
        timestamp: number;
        signature: string;
        parameters: Record<string, string | number | boolean>;
    };
}

export interface UploadProgress {
    fileName: string;
    uploaded: number;
    total: number;
    percent: number;
    attempt: number;
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

const transientStatus = (status: number) => status === 0 || status === 408 || status === 429 || status >= 500;
const wait = (milliseconds: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener("abort", () => {
        window.clearTimeout(timer);
        reject(new DOMException("Upload cancelled", "AbortError"));
    }, { once: true });
});

const sendChunk = (authorization: UploadAuthorization, file: File, start: number, end: number, attempt: number, signal?: AbortSignal, onProgress?: (progress: UploadProgress) => void) => new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", authorization.cloudinary.uploadUrl);
    xhr.setRequestHeader("X-Unique-Upload-Id", authorization.upload_id);
    xhr.setRequestHeader("Content-Range", `bytes ${start}-${end - 1}/${file.size}`);
    xhr.upload.onprogress = (event) => onProgress?.({ fileName: file.name, uploaded: start + event.loaded, total: file.size, percent: Math.round(((start + event.loaded) / file.size) * 100), attempt });
    xhr.onerror = () => reject(Object.assign(new Error("Cloudinary network error"), { status: 0 }));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    xhr.onload = () => {
        let payload: Record<string, unknown> = {};
        try { payload = JSON.parse(xhr.responseText || "{}"); } catch { payload = {}; }
        if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
        else reject(Object.assign(new Error(String((payload.error as { message?: string })?.message || `Cloudinary rejected chunk with ${xhr.status}`)), { status: xhr.status }));
    };
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    const form = new FormData();
    form.append("file", file.slice(start, end), file.name);
    form.append("api_key", authorization.cloudinary.apiKey);
    form.append("timestamp", String(authorization.cloudinary.timestamp));
    form.append("signature", authorization.cloudinary.signature);
    Object.entries(authorization.cloudinary.parameters).forEach(([key, value]) => {
        if (key !== "timestamp") form.append(key, String(value));
    });
    xhr.send(form);
});

const chunkWithRetry = async (authorization: UploadAuthorization, file: File, start: number, end: number, signal?: AbortSignal, onProgress?: (progress: UploadProgress) => void) => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            return await sendChunk(authorization, file, start, end, attempt, signal, onProgress);
        } catch (error) {
            lastError = error;
            if (signal?.aborted || error instanceof DOMException || !transientStatus(Number((error as { status?: number }).status)) || attempt === 5) throw error;
            const retryAfter = Math.min(750 * (2 ** (attempt - 1)) + Math.random() * 400, 10_000);
            await wait(retryAfter, signal);
        }
    }
    throw lastError;
};

const completeWithRetry = async (systemSlug: string, sessionId: string, uploadId: string, signal?: AbortSignal) => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
        signal?.throwIfAborted();
        try {
            await api.post(`/admin/knowledge/sessions/${sessionId}/uploads/${uploadId}/complete`, { system_slug: systemSlug }, { signal });
            return;
        } catch (error) {
            const status = Number((error as { response?: { status?: number } }).response?.status || 0);
            if (!transientStatus(status) || attempt === 4) throw error;
            await wait(Math.min(750 * (2 ** (attempt - 1)), 8_000), signal);
        }
    }
};

export const uploadSourcesDirect = async (systemSlug: string, sessionId: string, files: File[], options: { signal?: AbortSignal; onProgress?: (progress: UploadProgress) => void } = {}) => {
    for (const file of files) {
        const fingerprint = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
        const initiated = await api.post(`/admin/knowledge/sessions/${sessionId}/uploads/initiate`, {
            system_slug: systemSlug, name: file.name, mime_type: file.type || "application/octet-stream", size: file.size, fingerprint,
        });
        let authorization = initiated.data.data as UploadAuthorization;
        if (authorization.duplicate) continue;
        const storageKey = `vizr-upload:${systemSlug}:${sessionId}:${authorization.upload_id}`;
        let offset = Math.min(Number(localStorage.getItem(storageKey) || authorization.bytes_uploaded || 0), file.size);
        try {
            while (offset < file.size) {
                options.signal?.throwIfAborted();
                if (Date.now() / 1000 - authorization.cloudinary.timestamp > 3000) {
                    const refreshed = await api.post(`/admin/knowledge/sessions/${sessionId}/uploads/${authorization.upload_id}/refresh`, { system_slug: systemSlug });
                    authorization = { ...authorization, ...refreshed.data.data };
                }
                const end = Math.min(offset + authorization.chunk_size, file.size);
                await chunkWithRetry(authorization, file, offset, end, options.signal, options.onProgress);
                offset = end;
                localStorage.setItem(storageKey, String(offset));
                await api.patch(`/admin/knowledge/sessions/${sessionId}/uploads/${authorization.upload_id}/progress`, { system_slug: systemSlug, bytes: offset }).catch(() => undefined);
            }
            await completeWithRetry(systemSlug, sessionId, authorization.upload_id, options.signal);
            localStorage.removeItem(storageKey);
        } catch (error) {
            if (options.signal?.aborted) {
                await api.delete(`/admin/knowledge/sessions/${sessionId}/uploads/${authorization.upload_id}`, { data: { system_slug: systemSlug } }).catch(() => undefined);
                localStorage.removeItem(storageKey);
            }
            throw error;
        }
    }
    return getSession(systemSlug, sessionId);
};

export const askQuestion = async (systemSlug: string, sessionId: string, question: string) => {
    const response = await api.post(`/admin/knowledge/sessions/${sessionId}/chat`, { system_slug: systemSlug, question });
    return response.data.data as KnowledgeMessage;
};
