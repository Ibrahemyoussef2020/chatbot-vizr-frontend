import { useState, useCallback } from "react";
import {
    type CoreMessage,
    type AIProvider,
    type AIGatewayOptions,
    generateAICompletion,
    streamAICompletion,
} from "@/services/aiGateway";

export interface UseAIGatewayOptions {
    defaultProvider?: AIProvider;
    defaultOptions?: AIGatewayOptions;
}

export const useAIGateway = (config?: UseAIGatewayOptions) => {
    const [provider, setProvider] = useState<AIProvider>(config?.defaultProvider || "vercel");
    const [options, setOptions] = useState<AIGatewayOptions>(config?.defaultOptions || {});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Generate text non-streamed
     */
    const generateText = useCallback(
        async (prompt: string | CoreMessage[], overrideProvider?: AIProvider, overrideOptions?: AIGatewayOptions): Promise<string> => {
            setIsLoading(true);
            setError(null);
            try {
                const text = await generateAICompletion(
                    prompt,
                    overrideProvider || provider,
                    { ...options, ...overrideOptions }
                );
                return text;
            } catch (err: any) {
                const msg = err?.response?.data?.error || err?.message || "Failed to generate AI completion.";
                setError(msg);
                throw new Error(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [provider, options]
    );

    /**
     * Stream text completion with real-time callback
     */
    const streamText = useCallback(
        async (
            messages: CoreMessage[],
            onChunk: (chunk: string) => void,
            onFinish?: () => void,
            overrideProvider?: AIProvider,
            overrideOptions?: AIGatewayOptions
        ): Promise<void> => {
            setIsLoading(true);
            setError(null);

            await streamAICompletion(
                messages,
                overrideProvider || provider,
                { ...options, ...overrideOptions },
                (chunk) => {
                    onChunk(chunk);
                },
                () => {
                    setIsLoading(false);
                    if (onFinish) onFinish();
                },
                (err) => {
                    setIsLoading(false);
                    setError(err.message);
                }
            );
        },
        [provider, options]
    );

    /**
     * Generate an AI Copilot reply suggestion for a chat thread
     */
    const suggestReply = useCallback(
        async (
            chatMessages: Array<{ role?: string; sender_type?: string; senderType?: string; content: string }>,
            systemInstructions?: string,
            onChunk?: (chunk: string) => void
        ): Promise<string> => {
            setIsLoading(true);
            setError(null);

            const formattedMessages: CoreMessage[] = chatMessages.map((m) => {
                const sender = m.sender_type || m.senderType || m.role;
                const isVisitor = sender === "visitor" || sender === "user";
                return {
                    role: isVisitor ? "user" : "assistant",
                    content: m.content || "",
                };
            });

            const finalOptions: AIGatewayOptions = {
                ...options,
                systemPrompt: systemInstructions || "You are a helpful customer support AI copilot. Generate a polite, concise, and professional reply.",
            };

            let accumulatedText = "";

            if (onChunk) {
                await streamText(
                    formattedMessages,
                    (chunk) => {
                        accumulatedText += chunk;
                        onChunk(chunk);
                    },
                    undefined,
                    provider,
                    finalOptions
                );
            } else {
                accumulatedText = await generateText(formattedMessages, provider, finalOptions);
            }

            return accumulatedText;
        },
        [provider, options, generateText, streamText]
    );

    return {
        provider,
        setProvider,
        options,
        setOptions,
        isLoading,
        error,
        setError,
        generateText,
        streamText,
        suggestReply,
    };
};
