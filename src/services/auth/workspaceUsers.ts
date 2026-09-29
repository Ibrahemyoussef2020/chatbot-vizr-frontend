import api from "@/api";

export type WorkspaceUser = {
    id: string;
    name: string;
    email: string;
    legacyRole: string;
    isActive: boolean;
    securityRole: { id: string; name: string; code: string; scope: string } | null;
};

export const fetchWorkspaceUsers = async (systemSlug?: string) => {
    const response = await api.get<{ data: WorkspaceUser[] }>("/admin/users", { params: { system_slug: systemSlug } });
    return response.data.data;
};

export const assignWorkspaceUserRole = async (userId: string, roleId: string, systemSlug?: string) => {
    await api.patch(`/admin/users/${userId}/role`, { roleId, system_slug: systemSlug });
};

export const createWorkspaceUser = async (payload: { name: string; email: string; password: string; roleId: string }, systemSlug?: string) => {
    const response = await api.post<{ data: WorkspaceUser }>("/admin/users", { ...payload, system_slug: systemSlug });
    return response.data.data;
};
