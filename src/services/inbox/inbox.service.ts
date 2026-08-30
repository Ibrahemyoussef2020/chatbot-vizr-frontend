import api from "@/api";
import type {
    ThreadListResponse,
    ThreadDetailResponse,
    ThreadItem,
} from "@/services/dashboard/analytics";

export interface FilterThreadsParams {
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
}

export interface UpdateSidebarPayload {
    visitor?: { name?: string; email?: string; phone?: string };
    priority?: string;
    status?: string;
    tagAction?: { action: "add" | "remove"; tag: string };
    noteAction?: { action: "add" | "delete"; content?: string; noteId?: string; author?: string };
}

export const getFilteredThreadsApi = async (params: FilterThreadsParams): Promise<ThreadListResponse> => {
    const response = await api.get("/admin/threads", { params });
    const payload = response.data.data || response.data;
    return {
        total: payload.total || 0,
        page: payload.page || 1,
        limit: payload.limit || 15,
        totalPages: payload.totalPages || 1,
        threads: payload.threads || [],
    };
};

export const getThreadMessagesApi = async (threadId: string): Promise<ThreadDetailResponse> => {
    const response = await api.get(`/admin/threads/${threadId}/messages`);
    return (response.data.data || response.data) as ThreadDetailResponse;
};

export const updateThreadSidebarApi = async (
    threadId: string,
    payload: UpdateSidebarPayload,
) => {
    const response = await api.put(`/admin/threads/${threadId}/sidebar`, payload);
    return response.data as { success: boolean; data: Partial<ThreadItem> };
};

export const assignThreadToAgentApi = async (
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

export const replyToThreadApi = async (
    threadId: string,
    content: string,
    senderName: string = "Support Agent",
) => {
    const response = await api.post("/admin/reply-thread", {
        threadId,
        thread_id: threadId,
        content,
        senderName,
        sender_name: senderName,
    });
    return response.data;
};

export const updateThreadStatusApi = async (
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
