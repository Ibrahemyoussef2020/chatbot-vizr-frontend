import api from "@/api";
import { isAxiosError } from "axios";

export const aiGatewayErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        let data = error.response?.data;
        if (typeof data === "string") {
            try { data = JSON.parse(data); } catch { data = undefined; }
        }
        return data?.message || "AI request failed. Please retry.";
    }
    return error instanceof Error ? error.message : "AI request failed. Please retry.";
};

export interface CoreMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
}

export interface AIGatewayOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    threadId?: string;
    systemSlug?: string;
}

export type AIProvider = "vercel" | "custom" | string;

export interface GenerateResponse {
    success: boolean;
    text: string;
}

/**
 * Non-streaming AI text generation call
 */
export const generateAICompletion = async (
    prompt: string | CoreMessage[],
    provider: AIProvider = "vercel",
    options?: AIGatewayOptions
): Promise<string> => {
    const res = await api.post<GenerateResponse>("/ai/generate", {
        prompt,
        provider,
        options,
    });
    return res.data.text;
};

/**
 * Real-time SSE streaming AI completion
 */
export const streamAICompletion = async (
    messages: CoreMessage[],
    provider: AIProvider = "vercel",
    options?: AIGatewayOptions,
    onChunk?: (chunk: string) => void,
    onFinish?: () => void,
    onError?: (err: Error) => void
): Promise<void> => {
    try {
        let lastSeenIndex = 0;

        await api.post(
            "/ai/stream",
            { messages, provider, options },
            {
                responseType: "text",
                onDownloadProgress: (progressEvent) => {
                    const target = progressEvent.event?.target as XMLHttpRequest | undefined;
                    if (target && target.status >= 400) return;
                    const fullText = target?.responseText || "";
                    const chunk = fullText.slice(lastSeenIndex);
                    lastSeenIndex = fullText.length;

                    if (chunk && onChunk) {
                        onChunk(chunk);
                    }
                },
            }
        );

        if (onFinish) onFinish();
    } catch (err) {
        const error = new Error(aiGatewayErrorMessage(err));
        if (onError) onError(error);
        else throw error;
    }
};
