import api from "@/api";

export interface DashboardStats {
    total: number;
    open: number;
    pending: number;
    closed: number;
    unassigned: number;
    recent: number;
    recent_message_count: number;
}

export interface AssignedAgent {
    id?: string;
    name?: string;
    email?: string;
}

export interface ThreadNoteItem {
    id: string;
    content: string;
    author: string;
    created_at: string;
}

export interface ThreadItem {
    id: string;
    user_name: string;
    user_email?: string;
    user_phone?: string;
    system_slug: string;
    received_from: "web" | "whatsapp" | "telegram" | "gmail";
    latest_message?: string;
    latest_message_at?: string;
    status: string;
    priority?: string;
    assigned_agent?: AssignedAgent;
    tags?: string[];
    notes?: ThreadNoteItem[];
    created_at: string;
    updated_at: string;
}

export interface ThreadMessageItem {
    id: string;
    sender_type: "visitor" | "assistant" | "system" | "user" | "agent" | string;
    received_from: "web" | "whatsapp" | "telegram" | "gmail";
    content: string;
    attachments?: Array<{ url: string; fileName: string; fileType: string }>;
    created_at: string;
}


export interface ThreadDetailResponse {
    thread: ThreadItem;
    messages: ThreadMessageItem[];
}

export interface OverviewData {
    workspace: string;
    stats: DashboardStats;
    recent_threads: ThreadItem[];
}

export interface TimeSeriesPoint {
    date: string;
    total: number;
    open: number;
    closed: number;
}

export interface ChannelItem {
    name: string;
    count: number;
    sharePercent: number;
}

export interface TopicItem {
    topic: string;
    count: number;
    sharePercent: number;
}

export interface ResolutionItem {
    label: string;
    value: number;
    color: string;
}

export interface HourlyItem {
    hour: string;
    count: number;
}

export interface AnalyticsData {
    workspace: string;
    days: number;
    summary: {
        totalInPeriod: number;
        activeInPeriod: number;
        endedInPeriod: number;
        slaResponseSec: number;
        csatScore: number;
        aiResolutionPercent: number;
    };
    time_series: TimeSeriesPoint[];
    channels: ChannelItem[];
    topics: TopicItem[];
    resolution_split: ResolutionItem[];
    hourly_activity: HourlyActivityItem[];
}

export interface HourlyActivityItem {
    hour: string;
    count: number;
}

export interface ThreadListResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    threads: ThreadItem[];
}

export const fetchDashboardOverview = async (systemSlug?: string) => {
    const response = await api.get("/admin/stats", {
        params: { system_slug: systemSlug },
    });
    return (response.data.data || response.data) as OverviewData;
};

export const fetchThreadAnalytics = async (days = 7, systemSlug?: string) => {
    const response = await api.get("/admin/threads/time", {
        params: { days, system_slug: systemSlug },
    });
    return (response.data.data || response.data) as AnalyticsData;
};

export const fetchFilteredThreads = async (params: {
    system_slug?: string;
    status?: string;
    assigned?: string;
    channel?: string;
    tag?: string;
    priority?: string;
    topic?: string;
    days?: number;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
}) => {
    const response = await api.get("/admin/threads", { params });
    const payload = response.data.data || response.data;
    return {
        total: payload.total || 0,
        page: payload.page || 1,
        limit: payload.limit || 15,
        totalPages: payload.totalPages || 1,
        threads: payload.threads || [],
    } as ThreadListResponse;
};

export const fetchThreadMessages = async (threadId: string) => {
    const response = await api.get(`/admin/threads/${threadId}/messages`);
    return (response.data.data || response.data) as ThreadDetailResponse;
};

export const updateThreadSidebar = async (
    threadId: string,
    payload: {
        visitor?: { name?: string; email?: string; phone?: string };
        priority?: string;
        status?: string;
        tagAction?: { action: "add" | "remove"; tag: string };
        noteAction?: { action: "add" | "delete"; content?: string; noteId?: string; author?: string };
    },
) => {
    const response = await api.put(`/admin/threads/${threadId}/sidebar`, payload);
    return response.data;
};

export const assignThreadToAgent = async (
    threadId: string,
    agentId: string,
    agentName: string,
    agentEmail: string,
) => {
    const response = await api.post("/admin/assign-thread", {
        threadId,
        thread_id: threadId,
        agentId,
        agent_id: agentId,
        agentName,
        agent_name: agentName,
        agentEmail,
        agent_email: agentEmail,
    });
    return response.data;
};

export const replyToThread = async (
    threadId: string,
    content: string,
    senderName?: string,
) => {
    const response = await api.post("/admin/reply-thread", {
        threadId,
        thread_id: threadId,
        content,
        senderName: senderName || "Support Agent",
        sender_name: senderName || "Support Agent",
    });
    return response.data;
};

export const updateThreadStatus = async (
    threadId: string,
    status?: string,
    priority?: string,
) => {
    const response = await api.put(`/admin/threads/${threadId}`, {
        status,
        priority,
    });
    return response.data;
};
