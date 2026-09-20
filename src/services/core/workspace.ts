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

export const createWorkspace = async (name: string, rate_limit = 60) => {
    const response = await api.post<{ data: Workspace }>("/admin/systems-mgmt", { name, rate_limit });

    return response.data.data;
};

export const updateWorkspace = async (
    identifier: string,
    input: Partial<Pick<Workspace, "name" | "is_active" | "rate_limit">>,
) => {
    const response = await api.put<{ data: Workspace }>(`/admin/systems-mgmt/${identifier}`, input);
    return response.data.data;
};

export const deleteWorkspace = async (identifier: string) => {
    const response = await api.delete<{ data: Workspace }>(`/admin/systems-mgmt/${identifier}`);
    return response.data.data;
};
