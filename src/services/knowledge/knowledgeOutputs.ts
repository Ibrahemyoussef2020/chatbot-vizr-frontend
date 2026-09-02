import api from "@/api";
import type { GeneratedOutput, GeneratedSection, GeneratedSectionInput } from "./generatedOutputs";

export type OutputKind = "plan" | "report";
export type EditMode = "manual" | "ai";

interface ApiSection {
    id: string; key: string; order: number; title: string; description: string;
    notes?: GeneratedSection["notes"]; charts?: GeneratedSection["charts"];
    status: GeneratedSection["status"]; error?: string; generation_attempt?: number;
    created_at: string; updated_at: string;
}

interface ApiOutput {
    id: string; session_id: string; kind: OutputKind; title: string; description: string; category: string;
    status: GeneratedOutput["status"]; version: number; schema_count: number;
    is_saved?: boolean; is_shared?: boolean;
    schema_status?: GeneratedOutput["schemaStatus"]; created_at: string; updated_at: string;
    schemas?: ApiSection[];
}

const mapSection = (section: ApiSection): GeneratedSection => ({
    id: section.key, schemaId: section.id, order: section.order, title: section.title,
    description: section.description, notes: section.notes || [], charts: section.charts || [],
    status: section.status, error: section.error, generationAttempt: section.generation_attempt || 0,
});

const mapOutput = (output: ApiOutput): GeneratedOutput => ({
    id: output.id, sessionId: output.session_id, kind: output.kind, title: output.title, description: output.description,
    category: output.category, status: output.status, version: output.version,
    isSaved: Boolean(output.is_saved), isShared: Boolean(output.is_shared),
    schemaCount: output.schema_count, schemaStatus: output.schema_status || {},
    createdAt: output.created_at, updatedAt: output.updated_at,
    sections: (output.schemas || []).map(mapSection).sort((left, right) => left.order - right.order),
});

const basePath = (sessionId: string, kind: OutputKind) => `/admin/knowledge/sessions/${sessionId}/outputs/${kind}`;

export const listOutputs = async (systemSlug: string, sessionId: string, kind: OutputKind) => {
    const response = await api.get(basePath(sessionId, kind), { params: { system_slug: systemSlug } });
    return (response.data.data as ApiOutput[]).map(mapOutput);
};

export const listSavedOutputs = async (systemSlug: string) => {
    const response = await api.get("/admin/knowledge/outputs/saved", { params: { system_slug: systemSlug } });
    return (response.data.data as ApiOutput[]).map(mapOutput);
};

export const getOutput = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string) => {
    const response = await api.get(`${basePath(sessionId, kind)}/${outputId}`, { params: { system_slug: systemSlug } });
    return mapOutput(response.data.data as ApiOutput);
};

export const saveOutput = async (systemSlug: string, sessionId: string, kind: OutputKind, payload: unknown) => {
    const response = await api.post(basePath(sessionId, kind), { ...(payload as object), system_slug: systemSlug });
    return mapOutput(response.data.data as ApiOutput);
};

export const generateOutput = async (systemSlug: string, sessionId: string, kind: OutputKind, instruction?: string) => {
    const response = await api.post(`${basePath(sessionId, kind)}/generate`, { system_slug: systemSlug, instruction });
    return mapOutput(response.data.data as ApiOutput);
};

export const createOutputSchema = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string, payload: unknown) => {
    const response = await api.post(`${basePath(sessionId, kind)}/${outputId}/schemas`, { ...(payload as object), system_slug: systemSlug });
    return mapSection(response.data.data as ApiSection);
};

export const editOutputSchema = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string, schemaId: string, mode: EditMode, payload: GeneratedSectionInput | { instruction: string }) => {
    const response = await api.patch(`${basePath(sessionId, kind)}/${outputId}/schemas/${schemaId}`, { system_slug: systemSlug, mode, data: payload });
    return mapSection(response.data.data as ApiSection);
};

export const retryOutputSchema = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string, schemaId: string, instruction?: string) => {
    const response = await api.post(`${basePath(sessionId, kind)}/${outputId}/schemas/${schemaId}/retry`, { system_slug: systemSlug, instruction });
    return mapSection(response.data.data as ApiSection);
};

export const deleteOutputSchema = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string, schemaId: string) => {
    await api.delete(`${basePath(sessionId, kind)}/${outputId}/schemas/${schemaId}`, { data: { system_slug: systemSlug } });
};

export const setOutputSaved = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string, saved: boolean) => {
    const response = await api.patch(`${basePath(sessionId, kind)}/${outputId}/saved`, { system_slug: systemSlug, saved });
    return mapOutput(response.data.data as ApiOutput);
};

export const regenerateOutput = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string) => {
    const response = await api.post(`${basePath(sessionId, kind)}/${outputId}/regenerate`, { system_slug: systemSlug });
    return mapOutput(response.data.data as ApiOutput);
};

export const shareOutput = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string) => {
    const response = await api.post(`${basePath(sessionId, kind)}/${outputId}/share`, { system_slug: systemSlug });
    return String(response.data.data.token);
};

export const unshareOutput = async (systemSlug: string, sessionId: string, kind: OutputKind, outputId: string) => {
    await api.delete(`${basePath(sessionId, kind)}/${outputId}/share`, { data: { system_slug: systemSlug } });
};

export const getSharedOutput = async (token: string) => {
    const response = await api.get(`/knowledge/shared/${token}`);
    return mapOutput(response.data.data as ApiOutput);
};
