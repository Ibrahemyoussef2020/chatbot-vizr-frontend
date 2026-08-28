import api from "@/api";

export interface Attachment {
    name: string;
    url: string;
    type?: string;
    size?: number;
}

export interface PublicMessage {
    id: string;
    senderType: "visitor" | "assistant";
    content: string;
    attachments?: Attachment[];
    createdAt: string;
}

const SESSION_KEY = "leadbot_public_chat";

const session = () => {
    try {
        const item = localStorage.getItem(SESSION_KEY);
        return item ? (JSON.parse(item) as { id: string; token: string }) : null;
    } catch {
        return null;
    }
};

const headers = (token: string) => ({
    "X-Chat-Session": token,
});

export const restorePublicChat = () => session();

export interface PublicChatVisitor {
    name: string;
    email?: string;
    phone?: string;
}

export const createPublicChat = async (visitor: PublicChatVisitor) => {
    const { data } = await api.post("/system/chat/thread/create", {
        systemSlug: "demo",
        user_name: visitor.name,
        user_email: visitor.email || null,
        user_phone: visitor.phone || null,
    });

    const value = {
        id: data.thread.id as string,
        token: data.sessionToken as string,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(value));

    return value;
};

export const getPublicMessages = async (id: string, token: string, page = 1) => {
    const response = await api.get(`/system/chat/${id}/messages`, {
        headers: headers(token),
        params: { page },
    });

    return response.data as {
        messages: PublicMessage[];
        meta: { page: number; limit: number; total: number; pages: number };
        thread: { id: string; status: string };
    };
};

export const sendPublicMessage = async (
    id: string,
    token: string,
    message: string,
    attachments?: Attachment[],
) => {
    const response = await api.post(
        "/system/chat",
        {
            threadId: id,
            message,
            attachments,
        },
        {
            headers: headers(token),
        },
    );

    return response.data as {
        message: PublicMessage;
        reply?: PublicMessage;
    };
};

export const endPublicChat = async (id: string, token: string) => {
    const response = await api.post(
        `/system/chat/${id}/end`,
        {},
        {
            headers: headers(token),
        },
    );

    localStorage.removeItem(SESSION_KEY);

    return response.data;
};
