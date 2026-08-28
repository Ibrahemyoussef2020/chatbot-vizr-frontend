import api from "@/api";

export interface WidgetConfigData {
    id?: string;
    name: string;
    status: "active" | "inactive";
    allowed_domains: string[];
    settings?: {
        theme?: "light" | "dark";
        primary_color?: string;
        welcome_message?: string;
    };
    branding?: {
        theme?: "light" | "dark";
        primary_color?: string;
        welcome_message?: string;
    };
}

export const fetchWidgetConfig = async (systemSlug?: string): Promise<WidgetConfigData> => {
    const res = await api.get("/admin/widgets-mgmt", { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const saveWidgetConfig = async (
    systemSlug?: string,
    payload?: Partial<WidgetConfigData>,
): Promise<WidgetConfigData> => {
    const res = await api.post("/admin/widgets-mgmt", payload, { params: { system_slug: systemSlug } });
    return res.data.data;
};

export const deleteWidgetConfig = async (systemSlug?: string): Promise<boolean> => {
    await api.delete("/admin/widgets-mgmt", { params: { system_slug: systemSlug } });
    return true;
};

export const fetchWidgetEmbedScript = async (systemSlug?: string): Promise<string> => {
    const res = await api.get("/admin/widgets-mgmt/embed-script", { params: { system_slug: systemSlug } });
    return res.data.data;
};
