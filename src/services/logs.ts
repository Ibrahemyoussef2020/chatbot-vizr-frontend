import api from "@/api";

export interface LogItem {
    id: string;
    level: "info" | "warn" | "error";
    category: string;
    message: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export const fetchSystemLogs = async (level?: string, systemSlug?: string) => {
    const response = await api.get("/admin/logs", {
        params: { level, system_slug: systemSlug },
    });
    return response.data.data as LogItem[];
};

export const downloadSystemLogs = async (systemSlug?: string) => {
    const response = await api.get("/admin/logs/download", {
        params: { system_slug: systemSlug },
        responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `system-logs-${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
