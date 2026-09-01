import api from "@/api";

export interface SecurityRoleData {
    id: string;
    code: string;
    name: string;
    description: string;
    scope: "business" | "workspace";
    is_system: boolean;
    system_id?: string | null;
    permissions: Array<{ id: string; name: string }>;
    users_count: number;
}

export interface PermissionData {
    id: string;
    name: string;
    category: string;
    description: string;
    scope: "business" | "workspace";
    roles_count: number;
}

export const fetchSecurityRoles = async (systemSlug?: string): Promise<SecurityRoleData[]> => {
    const res = await api.get("/admin/security/roles", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const saveSecurityRole = async (
    payload: { name: string; system_id?: string | null; system_slug?: string; selectedPermissions?: string[] },
    roleId?: string,
): Promise<boolean> => {
    if (roleId) {
        await api.put(`/admin/security/roles/${roleId}`, payload);
    } else {
        await api.post("/admin/security/roles", payload);
    }
    return true;
};

export const deleteSecurityRole = async (roleId: string): Promise<boolean> => {
    await api.delete(`/admin/security/roles/${roleId}`);
    return true;
};

export const fetchPermissions = async (): Promise<PermissionData[]> => {
    const res = await api.get("/admin/security/permissions");
    return res.data.data;
};
