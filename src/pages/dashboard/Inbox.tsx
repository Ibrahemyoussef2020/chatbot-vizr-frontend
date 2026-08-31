import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchTags, type TagItem } from "@/services/dashboard/tags";
import { useUrlSearchParams } from "@/hooks/useUrlSearchParams";
import { useAIGateway } from "@/hooks/useAIGateway";
import {
    fetchInboxThreads,
    fetchInboxMessages,
    appendReplyChunk,
    setReplyText,
} from "@/redux/inboxSlice";

import {
    ThreadList,
    MessageFeed,
    Composer,
    CustomerProfile,
    TicketDetails,
    ConversationTags,
    InternalNotes,
    InboxFilterSidebar,
} from "@/components/layouts/inbox";

const formatDate = (value?: string) => {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
};

const agentOptions = [
    { id: "unassigned", name: "Unassigned", email: "" },
    { id: "agent-101", name: "Sarah Support Agent", email: "sarah.agent@vizr.local" },
    { id: "agent-102", name: "Karim Tech Lead", email: "karim.lead@vizr.local" },
    { id: "agent-103", name: "Amr Customer Success", email: "amr.cs@vizr.local" },
];

const quickTemplates = [
    "Hello! I am following up on your request. How can I assist you further today?",
    "Your order status has been updated. You will receive tracking updates shortly.",
    "Thank you for contacting support! Our team is currently investigating this.",
];

const defaultTagPresets = [
    "VIP Customer",
    "Urgent Support",
    "Billing & Invoice",
    "Technical Bug",
    "Sales Opportunity",
    "Feature Request",
];

const InboxPage = () => {
    const dispatch = useAppDispatch();
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const { selectedThread, messages, error } = useAppSelector((state) => state.inbox);
    const { filters, setFilter, resetFilters } = useUrlSearchParams();
    const [workspaceTags, setWorkspaceTags] = useState<TagItem[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const {
        provider: aiProvider,
        setProvider: setAiProvider,
        isLoading: isAILoading,
        suggestReply,
    } = useAIGateway({ defaultProvider: "vercel" });

    const getFilterParams = useCallback(() => ({
        system_slug: activeWorkspace?.slug,
        status: filters.status,
        assigned: filters.assigned,
        channel: filters.channel,
        priority: filters.priority,
        topic: filters.topic,
        days: filters.days,
        search: filters.search,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
    }), [activeWorkspace?.slug, filters]);

    useEffect(() => {
        void dispatch(fetchInboxThreads(getFilterParams()));
    }, [dispatch, getFilterParams]);

    useEffect(() => {
        let isMounted = true;
        fetchTags(activeWorkspace?.slug)
            .then((tags) => {
                if (isMounted) setWorkspaceTags(tags);
            })
            .catch(() => {
                if (isMounted) setWorkspaceTags([]);
            });
        return () => {
            isMounted = false;
        };
    }, [activeWorkspace?.slug]);

    useEffect(() => {
        if (selectedThread?.id) {
            void dispatch(fetchInboxMessages(selectedThread.id));
        }
    }, [dispatch, selectedThread?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleAISuggestReply = async () => {
        if (!messages.length) return;
        dispatch(setReplyText(""));
        try {
            await suggestReply(
                messages.map((m) => ({
                    sender_type: m.sender_type,
                    content: m.content,
                })),
                "You are an AI Copilot assisting a human support agent. Write a helpful, professional, and clear response to the customer on behalf of the agent.",
                (chunk) => {
                    dispatch(appendReplyChunk(chunk));
                }
            );
        } catch {
            // Handled via useAIGateway error state
        }
    };

    const availableTagNames = Array.from(
        new Set([
            ...workspaceTags.map((t) => t.name).filter((name): name is string => Boolean(name)),
            ...defaultTagPresets,
        ]),
    );

    const filterParams = getFilterParams();
    const activeFilterCount = [
        filters.status !== "all",
        filters.channel !== "all",
        filters.days !== 30,
        filters.priority !== "all",
        filters.sort !== "newest",
    ].filter(Boolean).length;

    return (
        <div className="mx-auto grid w-full max-w-[1600px] gap-4 p-1">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Team Chatbot Inbox</span>
                        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                            Live Stream
                        </span>
                    </div>
                    <h1 className="mb-0.5 mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                        Omnichannel Inbox & Ticket Command Center
                    </h1>
                </div>
            </header>

            {error && <Alert severity="error" className="mb-2">{error}</Alert>}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[620px]">
                {filtersOpen && (
                    <InboxFilterSidebar
                        filters={filters}
                        setFilter={setFilter}
                        resetFilters={resetFilters}
                        onClose={() => setFiltersOpen(false)}
                    />
                )}

                {/* Conversation list */}
                <ThreadList
                    search={filters.search || ""}
                    onSearchChange={(s) => setFilter("search", s)}
                    formatDate={formatDate}
                    filtersOpen={filtersOpen}
                    activeFilterCount={activeFilterCount}
                    onToggleFilters={() => setFiltersOpen((open) => !open)}
                />

                {/* COLUMN 2: Center Live Message Stream & Composer */}
                <Card variant="outlined" className={`!rounded-2xl !border-border !bg-surface-elevated flex flex-col overflow-hidden ${filtersOpen ? "lg:col-span-4" : "lg:col-span-5"}`}>
                    <MessageFeed
                        filterParams={filterParams}
                        formatDate={formatDate}
                        messagesEndRef={messagesEndRef}
                    />

                    {selectedThread && (
                        <Composer
                            quickTemplates={quickTemplates}
                            aiProvider={aiProvider}
                            onAIProviderChange={setAiProvider}
                            isAILoading={isAILoading}
                            onAISuggestReply={handleAISuggestReply}
                        />
                    )}
                </Card>

                {/* COLUMN 3: Right Customer Profile & Ticket Side Details */}
                <Card variant="outlined" className={`!rounded-2xl !border-border !bg-surface-elevated p-4 flex flex-col space-y-4 overflow-y-auto ${filtersOpen ? "lg:col-span-3" : "lg:col-span-4"}`}>
                    {selectedThread ? (
                        <>
                            <CustomerProfile filterParams={filterParams} />
                            <TicketDetails agentOptions={agentOptions} filterParams={filterParams} />
                            <ConversationTags availableTagNames={availableTagNames} />
                            <InternalNotes formatDate={formatDate} />
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No active thread selected.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default InboxPage;
