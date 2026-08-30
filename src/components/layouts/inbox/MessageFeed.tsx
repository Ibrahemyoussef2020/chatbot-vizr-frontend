import { type RefObject } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { HiOutlineUser } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { toggleThreadStatus } from "@/redux/inboxSlice";
import type { FilterThreadsParams } from "@/services/inbox";

export interface MessageFeedProps {
    filterParams: FilterThreadsParams;
    formatDate: (date?: string) => string;
    messagesEndRef: RefObject<HTMLDivElement | null>;
}

export const MessageFeed = ({
    filterParams,
    formatDate,
    messagesEndRef,
}: MessageFeedProps) => {
    const dispatch = useAppDispatch();
    const { selectedThread, messages, loadingMessages } = useAppSelector((state) => state.inbox);

    if (!selectedThread) {
        return (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                Select a conversation thread to view live stream.
            </div>
        );
    }

    const handleToggleStatus = () => {
        dispatch(
            toggleThreadStatus({
                threadId: selectedThread.id,
                currentStatus: selectedThread.status,
                filterParams,
            })
        );
    };

    return (
        <>
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/50">
                <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                        <HiOutlineUser className="text-base" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="m-0 text-sm font-bold text-foreground">{selectedThread.user_name}</h3>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                    selectedThread.status === "open"
                                        ? "bg-warning/15 text-warning"
                                        : "bg-success/15 text-success"
                                }`}
                            >
                                {selectedThread.status}
                            </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Thread ID: {selectedThread.id}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={handleToggleStatus}
                        sx={{
                            height: "28px",
                            fontSize: "0.72rem",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            borderRadius: "6px",
                            textTransform: "none",
                        }}
                    >
                        {selectedThread.status === "open" ? "Close Ticket" : "Reopen Ticket"}
                    </Button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-muted/20">
                {loadingMessages && (
                    <div className="flex h-full items-center justify-center">
                        <CircularProgress size={28} />
                    </div>
                )}

                {!loadingMessages && messages.map((msg) => {
                    const isClient = msg.sender_type === "user" || msg.sender_type === "visitor";
                    const agentLabel = (msg as any).agent_type === "human" ? "Human Support Agent" : "Vizr AI Bot";

                    return (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${isClient ? "items-start" : "items-end"}`}
                        >
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground">
                                <span className="font-semibold">{isClient ? (selectedThread.user_name || "Client") : agentLabel}</span>
                                <span>• {formatDate(msg.created_at)}</span>
                            </div>

                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${
                                    isClient
                                        ? "bg-card text-foreground border border-border rounded-tl-sm"
                                        : "bg-primary text-white rounded-tr-sm"
                                }`}
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>
        </>
    );
};
