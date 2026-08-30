import api from "@/api";

export interface CoreMessage {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
}

export interface AIGatewayOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    [key: string]: any;
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
    } catch (err: any) {
        const error = err instanceof Error ? err : new Error(err?.response?.data?.error || String(err));
        if (onError) onError(error);
        else throw error;
    }
};

