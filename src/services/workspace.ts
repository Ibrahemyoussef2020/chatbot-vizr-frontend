import api from "@/api";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    rate_limit: number;
    created_at?: string;
    updated_at?: string;
}

export const getWorkspaces = async () => {
    const response = await api.get<{ data: Workspace[] }>("/admin/systems-list");

    return response.data.data;
};

export const getWorkspace = async (identifier: string) => {
    const response = await api.get<{ data: Workspace }>(`/admin/systems-mgmt/${identifier}`);

    return response.data.data;
};

export const createWorkspace = async (name: string) => {
    const response = await api.post<{ data: Workspace }>("/admin/systems-mgmt", { name });

    return response.data.data;
};
