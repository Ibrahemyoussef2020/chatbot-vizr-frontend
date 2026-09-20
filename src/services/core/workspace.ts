import api from "@/api";

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    rate_limit: number;
    business_name?: string;
    industry?: string;
    website_url?: string;
    support_email?: string;
    support_phone?: string;
    country?: string;
    timezone?: string;
    currency?: string;
    selected_plan_code?: string;
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

export type WorkspaceProfileInput = Partial<Pick<Workspace,
    "name" | "business_name" | "industry" | "website_url" | "support_email" | "support_phone" |
    "country" | "timezone" | "currency" | "selected_plan_code" | "rate_limit" | "is_active"
>>;

export type CreateWorkspaceInput = Omit<WorkspaceProfileInput, "name" | "is_active"> & { name: string };

export const createWorkspace = async (input: CreateWorkspaceInput) => {
    const response = await api.post<{ data: Workspace }>("/admin/systems-mgmt", input);

    return response.data.data;
};

export const updateWorkspace = async (
    identifier: string,
    input: WorkspaceProfileInput,
) => {
    const response = await api.put<{ data: Workspace }>(`/admin/systems-mgmt/${identifier}`, input);
    return response.data.data;
};

export const deleteWorkspace = async (identifier: string) => {
    const response = await api.delete<{ data: Workspace }>(`/admin/systems-mgmt/${identifier}`);
    return response.data.data;
};
