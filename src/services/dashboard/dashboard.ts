import api from "@/api";
import type { ChannelItem, HourlyItem, TimeSeriesPoint, TopicItem } from "./analytics";

export interface EnrichedDashboardStats {
    total: number;
    open: number;
    pending: number;
    closed: number;
    unassigned: number;
    recent: number;
    recent_message_count: number;
    aiResolutionPercent: number;
    humanHandoffPercent: number;
    avgResponseSec: number;
    csatScore: number;
    ragAccuracyPercent: number;
    leadsCaptured: number;
    tokenRuns: number;
    crmTags: number;
}

export interface DashboardThread {
    id: string;
    user_name: string;
    user_email?: string;
    system_slug: string;
    status: "open" | "closed";
    created_at: string;
    updated_at: string;
}

export interface DashboardOverview {
    workspace: string;
    stats: EnrichedDashboardStats;
    time_series: TimeSeriesPoint[];
    channels: ChannelItem[];
    topics: TopicItem[];
    hourly_activity: HourlyItem[];
    recent_threads: DashboardThread[];
}

export const getDashboardOverview = async (
    systemSlug?: string,
    signal?: AbortSignal,
) => {
    const response = await api.get<{ data: DashboardOverview }>("/admin/stats", {
        params: systemSlug ? { system_slug: systemSlug } : undefined,
        signal,
    });

    return response.data.data;
};
