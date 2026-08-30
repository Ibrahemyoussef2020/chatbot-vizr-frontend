import api from "@/api";

export interface TagItem {
    id: string;
    label: string;
    name?: string;
    bg: string;
    color: string;
    description?: string;
    usageCount: number;
    systemSlug?: string;
    createdAt: string;
}

export interface CreateTagPayload {
    label: string;
    name?: string;
    bg?: string;
    color?: string;
    description?: string;
    systemSlug?: string;
}

export const fetchTags = async (systemSlug?: string) => {
    const response = await api.get("/admin/tags", {
        params: { system_slug: systemSlug },
    });
    return response.data.data as TagItem[];
};

export const createTag = async (payload: CreateTagPayload) => {
    const response = await api.post("/admin/tags", payload);
    return response.data.data as TagItem;
};

export const updateTag = async (id: string, payload: Partial<CreateTagPayload>) => {
    const response = await api.put(`/admin/tags/${id}`, payload);
    return response.data.data as TagItem;
};

export const deleteTag = async (id: string) => {
    const response = await api.delete(`/admin/tags/${id}`);
    return response.data as { success: boolean; id: string };
};
