import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState, useCallback, useRef } from "react";
import {
    HiOutlineUser,
    HiOutlinePaperAirplane,
    HiOutlineUserPlus,
    HiOutlineMagnifyingGlass,
    HiOutlineTag,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlinePlus,
    HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    fetchFilteredThreads,
    fetchThreadMessages,
    assignThreadToAgent,
    replyToThread,
    updateThreadStatus,
    updateThreadSidebar,
    type ThreadListResponse,
    type ThreadItem,
    type ThreadMessageItem,
} from "@/services/analytics";
import { fetchTags, type TagItem } from "@/services/tags";
import { useUrlSearchParams } from "@/hooks/useUrlSearchParams";
import { useAIGateway } from "@/hooks/useAIGateway";

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
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const { filters, setFilter } = useUrlSearchParams();

    const [loadingThreads, setLoadingThreads] = useState<boolean>(true);
    const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
    const [sendingReply, setSendingReply] = useState<boolean>(false);
    const [savingSidebar, setSavingSidebar] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const [threadsData, setThreadsData] = useState<ThreadListResponse | null>(null);
    const [selectedThread, setSelectedThread] = useState<ThreadItem | null>(null);
    const [messages, setMessages] = useState<ThreadMessageItem[]>([]);
    const [workspaceTags, setWorkspaceTags] = useState<TagItem[]>([]);
    const [replyText, setReplyText] = useState<string>("");
    const [statusTab, setStatusTab] = useState<string>("all");

    // Right Sidebar CRUD State
    const [editingVisitor, setEditingVisitor] = useState<boolean>(false);
    const [visitorName, setVisitorName] = useState<string>("");
    const [visitorEmail, setVisitorEmail] = useState<string>("");
    const [visitorPhone, setVisitorPhone] = useState<string>("");
    const [newTagInput, setNewTagInput] = useState<string>("");
    const [selectedTagPreset, setSelectedTagPreset] = useState<string>("");
    const [newNoteInput, setNewNoteInput] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Modular AI Gateway Hook Integration
    const {
        provider: aiProvider,
        setProvider: setAiProvider,
        isLoading: isAILoading,
        suggestReply,
    } = useAIGateway({ defaultProvider: "vercel" });

    const handleAISuggestReply = async () => {
        if (!messages.length) return;
        setReplyText("");
        try {
            await suggestReply(
                messages.map((m) => ({
                    sender_type: m.sender_type,
                    senderType: (m as any).senderType,
                    content: m.content,
                })),
                "You are an AI Copilot assisting a human support agent. Write a helpful, professional, and clear response to the customer on behalf of the agent.",
                (chunk) => {
                    setReplyText((prev) => prev + chunk);
                }
            );
        } catch {
            setError("AI Gateway stream failed. Please try again.");
        }
    };



    const loadThreads = useCallback(async () => {
        setLoadingThreads(true);
        setError("");

        try {
            const result = await fetchFilteredThreads({
                system_slug: activeWorkspace?.slug,
                status: statusTab !== "all" ? statusTab : filters.status,
                assigned: filters.assigned,
                channel: filters.channel,
                priority: filters.priority,
                topic: filters.topic,
                days: filters.days,
                search: filters.search,
                sort: filters.sort,
                page: filters.page,
                limit: filters.limit,
            });

            setThreadsData(result);
        } catch {
            setError("Failed to fetch conversations list.");
        } finally {
            setLoadingThreads(false);
        }
    }, [activeWorkspace, filters, statusTab]);

    useEffect(() => {
        let isMounted = true;
        void fetchFilteredThreads({
            system_slug: activeWorkspace?.slug,
            status: statusTab !== "all" ? statusTab : filters.status,
            assigned: filters.assigned,
            channel: filters.channel,
            priority: filters.priority,
            topic: filters.topic,
            days: filters.days,
            search: filters.search,
            sort: filters.sort,
            page: filters.page,
            limit: filters.limit,
        })
            .then((result) => {
                if (isMounted) {
                    setThreadsData(result);
                    if (result?.threads && result.threads.length > 0) {
                        setSelectedThread((prev) => (prev ? prev : result.threads[0]));
                    }
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to fetch conversations list.");
            })
            .finally(() => {
                if (isMounted) setLoadingThreads(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace, filters, statusTab]);

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

    const loadActiveMessages = useCallback(async (threadId: string) => {
        setLoadingMessages(true);
        try {
            const detail = await fetchThreadMessages(threadId);
            setMessages(detail.messages);
            if (detail.thread) {
                setSelectedThread(detail.thread);
                setVisitorName(detail.thread.user_name || "");
                setVisitorEmail(detail.thread.user_email || "");
                setVisitorPhone(detail.thread.user_phone || "");
            }
        } catch {
            setError("Failed to load thread messages.");
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const targetId = selectedThread?.id;

        if (targetId) {
            Promise.resolve().then(() => {
                if (!isMounted) return;
                setLoadingMessages(true);
                return fetchThreadMessages(targetId);
            }).then((detail) => {
                if (isMounted && detail) {
                    setMessages(detail.messages);
                    if (detail.thread) {
                        setSelectedThread(detail.thread);
                        setVisitorName(detail.thread.user_name || "");
                        setVisitorEmail(detail.thread.user_email || "");
                        setVisitorPhone(detail.thread.user_phone || "");
                    }
                }
            }).catch(() => {
                if (isMounted) setError("Failed to load thread messages.");
            }).finally(() => {
                if (isMounted) setLoadingMessages(false);
            });
        }

        return () => {
            isMounted = false;
        };
    }, [selectedThread?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedThread) return;

        setSendingReply(true);
        try {
            await replyToThread(selectedThread.id, replyText.trim(), "Support Agent");
            setReplyText("");
            await loadActiveMessages(selectedThread.id);
        } catch {
            setError("Failed to send message reply.");
        } finally {
            setSendingReply(false);
        }
    };

    const handleAssignAgent = async (threadId: string, agentId: string) => {
        const agent = agentOptions.find((a) => a.id === agentId);
        if (!agent) return;

        try {
            await assignThreadToAgent(threadId, agent.id, agent.name, agent.email);
            void loadThreads();
            if (selectedThread?.id === threadId) {
                void loadActiveMessages(threadId);
            }
        } catch {
            setError("Failed to assign agent to thread.");
        }
    };

    const handleToggleStatus = async (threadId: string, currentStatus: string) => {
        const nextStatus = currentStatus === "open" ? "ended" : "active";
        try {
            await updateThreadStatus(threadId, nextStatus);
            void loadThreads();
            if (selectedThread?.id === threadId) {
                void loadActiveMessages(threadId);
            }
        } catch {
            setError("Failed to update thread status.");
        }
    };

    // Right Sidebar CRUD Handlers
    const handleSaveVisitorDetails = async () => {
        if (!selectedThread) return;
        setSavingSidebar(true);

        try {
            const updated = await updateThreadSidebar(selectedThread.id, {
                visitor: {
                    name: visitorName.trim(),
                    email: visitorEmail.trim(),
                    phone: visitorPhone.trim(),
                },
            });
            if (updated.data) {
                setSelectedThread((prev) => prev ? { ...prev, ...updated.data } : null);
            }
            setEditingVisitor(false);
            void loadThreads();
        } catch {
            setError("Failed to update visitor details.");
        } finally {
            setSavingSidebar(false);
        }
    };

    const handleChangePriority = async (newPriority: string) => {
        if (!selectedThread) return;

        try {
            const updated = await updateThreadSidebar(selectedThread.id, {
                priority: newPriority,
            });
            if (updated.data) {
                setSelectedThread((prev) => prev ? { ...prev, priority: updated.data.priority } : null);
            }
            void loadThreads();
        } catch {
            setError("Failed to update priority.");
        }
    };

    const handleAddTag = async (tagNameToAdd?: string) => {
        const targetTag = tagNameToAdd || newTagInput.trim();
        if (!targetTag || !selectedThread) return;
        setSavingSidebar(true);

        try {
            const updated = await updateThreadSidebar(selectedThread.id, {
                tagAction: { action: "add", tag: targetTag },
            });
            if (updated.data) {
                setSelectedThread((prev) => prev ? { ...prev, tags: updated.data.tags } : null);
            }
            setNewTagInput("");
            setSelectedTagPreset("");
        } catch {
            setError("Failed to add tag.");
        } finally {
            setSavingSidebar(false);
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!selectedThread) return;

        try {
            const updated = await updateThreadSidebar(selectedThread.id, {
                tagAction: { action: "remove", tag: tagToRemove },
            });
            if (updated.data) {
                setSelectedThread((prev) => prev ? { ...prev, tags: updated.data.tags } : null);
            }
        } catch {
            setError("Failed to remove tag.");
        }
    };

    const handleAddInternalNote = async () => {
        if (!newNoteInput.trim() || !selectedThread) return;
        setSavingSidebar(true);

        try {
            const updated = await updateThreadSidebar(selectedThread.id, {
                noteAction: { action: "add", content: newNoteInput.trim(), author: "Support Agent" },
            });
            if (updated.data) {
                setSelectedThread((prev) => prev ? { ...prev, notes: updated.data.notes } : null);
            }
            setNewNoteInput("");
        } catch {
            setError("Failed to add internal note.");
        } finally {
            setSavingSidebar(false);
        }
    };

    const handleDeleteInternalNote = async (noteId: string) => {
        if (!selectedThread) return;

        try {
            const updated = await updateThreadSidebar(selectedThread.id, {
                noteAction: { action: "delete", noteId },
            });
            if (updated.data) {
                setSelectedThread((prev) => prev ? { ...prev, notes: updated.data.notes } : null);
            }
        } catch {
            setError("Failed to delete internal note.");
        }
    };

    // Combine fetched API tags with default fallback tag presets
    const availableTagNames = Array.from(
        new Set([
            ...workspaceTags.map((t) => t.name),
            ...defaultTagPresets,
        ]),
    );

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
                {/* COLUMN 1: Threads List & Filter Tabs (3 cols) */}
                <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated flex flex-col lg:col-span-3 overflow-hidden">
                    <div className="p-3 border-b border-border bg-surface-muted/50 space-y-2.5">
                        <div className="relative">
                            <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-muted-foreground text-sm" />
                            <input
                                type="text"
                                placeholder="Search threads or visitors..."
                                value={filters.search || ""}
                                onChange={(e) => setFilter("search", e.target.value)}
                                className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
                            {["all", "open", "closed"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusTab(tab)}
                                    className={`flex-1 rounded-lg py-1 text-[11px] font-bold capitalize transition-all ${statusTab === tab
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                        {loadingThreads && (
                            <div className="flex h-40 items-center justify-center">
                                <CircularProgress size={24} />
                            </div>
                        )}

                        {!loadingThreads && (threadsData?.threads || []).map((thread) => {
                            const isSelected = selectedThread?.id === thread.id;
                            const priority = thread.priority || "medium";

                            return (
                                <div
                                    key={thread.id}
                                    onClick={() => setSelectedThread(thread)}
                                    className={`p-3.5 cursor-pointer transition-all ${isSelected
                                        ? "bg-primary/10 border-l-4 border-l-primary"
                                        : "hover:bg-surface-muted/40"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-xs text-foreground truncate max-w-[130px]">
                                            {thread.user_name}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${priority === "high"
                                                ? "bg-danger/15 text-danger"
                                                : priority === "medium"
                                                    ? "bg-warning/15 text-warning"
                                                    : "bg-info/15 text-info"
                                                }`}
                                        >
                                            {priority.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="text-[11px] text-muted-foreground truncate mb-1">
                                        {thread.user_email || "No email provided"}
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                        <span className="font-mono text-primary/90">{thread.system_slug}</span>
                                        <span>{formatDate(thread.updated_at)}</span>
                                    </div>
                                </div>
                            );
                        })}

                        {!loadingThreads && !threadsData?.threads.length && (
                            <div className="p-8 text-center text-xs text-muted-foreground">
                                No matching conversations found.
                            </div>
                        )}
                    </div>
                </Card>

                {/* COLUMN 2: Center Live Message Stream & Composer (5 cols) */}
                <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated flex flex-col lg:col-span-5 overflow-hidden">
                    {selectedThread ? (
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
                                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${selectedThread.status === "open"
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
                                        onClick={() => handleToggleStatus(selectedThread.id, selectedThread.status)}
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
                                    const sender = msg.sender_type || (msg as any).senderType || (msg as any).role;
                                    const isVisitor = sender === "visitor" || sender === "user";
                                    const createdAt = msg.created_at || (msg as any).createdAt;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isVisitor ? "items-start" : "items-end"}`}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-muted-foreground">
                                                <span className="font-semibold">{isVisitor ? selectedThread.user_name : "Vizr AI / Agent"}</span>
                                                <span>• {formatDate(createdAt)}</span>
                                            </div>

                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm ${isVisitor
                                                    ? "bg-card text-foreground border border-border rounded-tl-sm"
                                                    : "bg-primary text-white rounded-tr-sm"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}


                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-3 border-t border-border bg-card space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/60 pb-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {quickTemplates.map((tmpl, i) => (
                                            <Chip
                                                key={i}
                                                label={tmpl.slice(0, 25) + "..."}
                                                onClick={() => setReplyText(tmpl)}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontSize: "0.68rem",
                                                    height: "22px",
                                                    borderColor: "var(--border)",
                                                    color: "var(--foreground)",
                                                    "&:hover": { bgcolor: "var(--accent)" },
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Modular AI Gateway Integration */}
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <Select
                                            value={aiProvider}
                                            onChange={(e) => setAiProvider(e.target.value as any)}
                                            size="small"
                                            sx={{
                                                height: "24px",
                                                fontSize: "0.68rem",
                                                color: "var(--foreground)",
                                                bgcolor: "var(--surface-muted)",
                                                borderRadius: "6px",
                                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                                            }}
                                        >
                                            <MenuItem value="vercel" sx={{ fontSize: "0.7rem" }}>⚡ Vercel Gateway</MenuItem>
                                            <MenuItem value="custom" sx={{ fontSize: "0.7rem" }}>⚙️ Custom AI</MenuItem>
                                        </Select>

                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={handleAISuggestReply}
                                            disabled={isAILoading || !messages.length}
                                            sx={{
                                                height: "24px",
                                                fontSize: "0.68rem",
                                                fontWeight: 700,
                                                borderColor: "var(--primary)",
                                                color: "var(--primary)",
                                                borderRadius: "6px",
                                                textTransform: "none",
                                                gap: "4px",
                                                "&:hover": { bgcolor: "var(--primary)/10" },
                                            }}
                                        >
                                            {isAILoading ? (
                                                <CircularProgress size={12} color="primary" />
                                            ) : (
                                                <>✨ AI Suggest Reply</>
                                            )}
                                        </Button>
                                    </div>
                                </div>


                                <div className="flex items-center gap-2">
                                    <TextField
                                        multiline
                                        maxRows={3}
                                        fullWidth
                                        placeholder="Type your message reply here..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                fontSize: "0.78rem",
                                                color: "var(--foreground)",
                                                bgcolor: "var(--background)",
                                                borderRadius: "8px",
                                                "& fieldset": { borderColor: "var(--border)" },
                                            },
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={handleSendReply}
                                        disabled={sendingReply || !replyText.trim()}
                                        sx={{
                                            height: "38px",
                                            minWidth: "44px",
                                            bgcolor: "var(--primary)",
                                            color: "#fff",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        {sendingReply ? <CircularProgress size={16} color="inherit" /> : <HiOutlinePaperAirplane className="text-base" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            Select a conversation thread to view live stream.
                        </div>
                    )}
                </Card>

                {/* COLUMN 3: Right Customer Profile & Ticket Side Details (4 cols - FULL CRUD) */}
                <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated p-4 flex flex-col lg:col-span-4 space-y-4 overflow-y-auto">
                    {selectedThread ? (
                        <>
                            {/* Visitor Profile CRUD Section */}
                            <div className="border-b border-border pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                                            <HiOutlineUser className="text-lg" />
                                        </div>
                                        <h3 className="m-0 text-sm font-black text-foreground">Customer Profile</h3>
                                    </div>

                                    <Tooltip title={editingVisitor ? "Cancel Edit" : "Edit Customer Info"}>
                                        <button
                                            onClick={() => setEditingVisitor(!editingVisitor)}
                                            className="p-1 text-muted-foreground hover:text-primary rounded-lg border border-border"
                                        >
                                            <HiOutlinePencilSquare className="text-base" />
                                        </button>
                                    </Tooltip>
                                </div>

                                {editingVisitor ? (
                                    <div className="space-y-2 mt-3">
                                        <input
                                            type="text"
                                            placeholder="Visitor Name"
                                            value={visitorName}
                                            onChange={(e) => setVisitorName(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Visitor Email"
                                            value={visitorEmail}
                                            onChange={(e) => setVisitorEmail(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Visitor Phone"
                                            value={visitorPhone}
                                            onChange={(e) => setVisitorPhone(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                                        />
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={handleSaveVisitorDetails}
                                            disabled={savingSidebar}
                                            sx={{
                                                height: "28px",
                                                fontSize: "0.72rem",
                                                bgcolor: "var(--primary)",
                                                borderRadius: "6px",
                                                width: "100%",
                                                textTransform: "none",
                                            }}
                                        >
                                            {savingSidebar ? "Saving..." : "Save Visitor Profile"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="mt-2 space-y-1 text-xs">
                                        <strong className="block text-foreground font-bold text-sm">{selectedThread.user_name}</strong>
                                        <span className="block text-muted-foreground">{selectedThread.user_email || "No email provided"}</span>
                                        {selectedThread.user_phone && (
                                            <span className="block text-primary/80 font-mono text-[11px]">{selectedThread.user_phone}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Priority & Agent Controls */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                                        Priority
                                    </span>
                                    <Select
                                        value={selectedThread.priority || "medium"}
                                        onChange={(e) => handleChangePriority(e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            height: "30px",
                                            fontSize: "0.72rem",
                                            color: "var(--foreground)",
                                            bgcolor: "var(--card)",
                                            borderRadius: "6px",
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                                        }}
                                    >
                                        <MenuItem value="high" sx={{ fontSize: "0.72rem" }}>🔴 HIGH</MenuItem>
                                        <MenuItem value="medium" sx={{ fontSize: "0.72rem" }}>🟡 MEDIUM</MenuItem>
                                        <MenuItem value="low" sx={{ fontSize: "0.72rem" }}>🔵 LOW</MenuItem>
                                    </Select>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                                        Agent
                                    </span>
                                    <Select
                                        value={selectedThread.assigned_agent?.id || "unassigned"}
                                        onChange={(e) => handleAssignAgent(selectedThread.id, e.target.value)}
                                        size="small"
                                        fullWidth
                                        sx={{
                                            height: "30px",
                                            fontSize: "0.72rem",
                                            color: "var(--foreground)",
                                            bgcolor: "var(--card)",
                                            borderRadius: "6px",
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                                        }}
                                    >
                                        {agentOptions.map((agent) => (
                                            <MenuItem key={agent.id} value={agent.id} sx={{ fontSize: "0.72rem" }}>
                                                <HiOutlineUserPlus className="mr-1 inline text-primary" /> {agent.name.split(" ")[0]}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {/* Tags Management CRUD */}
                            <div className="border-t border-border pt-3 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                        <HiOutlineTag className="text-primary" /> Conversation Tags
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-semibold">
                                        {selectedThread.tags?.length || 0} Tags
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {selectedThread.tags?.map((t) => (
                                        <Chip
                                            key={t}
                                            label={t}
                                            onDelete={() => handleRemoveTag(t)}
                                            size="small"
                                            sx={{
                                                fontSize: "0.68rem",
                                                height: "24px",
                                                bgcolor: "var(--primary)/15",
                                                color: "var(--primary)",
                                                fontWeight: 700,
                                            }}
                                        />
                                    ))}
                                    {!selectedThread.tags?.length && (
                                        <span className="text-[11px] text-muted-foreground italic">No tags added yet.</span>
                                    )}
                                </div>

                                {/* Select from Endpoint Workspace Tags or Add Custom Text Tag */}
                                <div className="space-y-1.5 pt-1">
                                    <Select
                                        value={selectedTagPreset}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setSelectedTagPreset(val);
                                            if (val) handleAddTag(val);
                                        }}
                                        displayEmpty
                                        size="small"
                                        fullWidth
                                        sx={{
                                            height: "30px",
                                            fontSize: "0.72rem",
                                            color: "var(--foreground)",
                                            bgcolor: "var(--card)",
                                            borderRadius: "6px",
                                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                                        }}
                                    >
                                        <MenuItem value="" disabled sx={{ fontSize: "0.72rem" }}>
                                            Select Tag from Endpoint...
                                        </MenuItem>
                                        {availableTagNames.map((tagName) => (
                                            <MenuItem key={tagName} value={tagName} sx={{ fontSize: "0.72rem" }}>
                                                🏷️ {tagName}
                                            </MenuItem>
                                        ))}
                                    </Select>

                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            placeholder="Or type custom tag text..."
                                            value={newTagInput}
                                            onChange={(e) => setNewTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                            className="flex-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleAddTag()}
                                            className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-primary/90"
                                        >
                                            <HiOutlinePlus />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Internal Agent Notes CRUD (PRIVATE TO TEAM ONLY) */}
                            <div className="border-t border-border pt-3 space-y-2 text-xs flex-1 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                                        <HiOutlineChatBubbleBottomCenterText className="text-warning text-sm" /> Internal Team Notes
                                    </span>
                                    <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-warning">
                                        Private to Team
                                    </span>
                                </div>

                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                    {selectedThread.notes?.map((n) => (
                                        <div key={n.id} className="rounded-xl border border-border bg-surface-muted/50 p-2.5 space-y-1">
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                <span className="font-bold text-foreground">{n.author}</span>
                                                <div className="flex items-center gap-1">
                                                    <span>{formatDate(n.created_at)}</span>
                                                    <button
                                                        onClick={() => handleDeleteInternalNote(n.id)}
                                                        className="text-danger hover:opacity-80 ml-1"
                                                    >
                                                        <HiOutlineTrash className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="m-0 text-xs text-foreground font-medium">{n.content}</p>
                                        </div>
                                    ))}
                                    {!selectedThread.notes?.length && (
                                        <div className="p-3 text-center text-[11px] text-muted-foreground italic border border-dashed border-border rounded-xl">
                                            No internal notes written yet. Notes are private and invisible to visitors.
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 space-y-1.5">
                                    <textarea
                                        rows={2}
                                        placeholder="Add an internal note for your support team..."
                                        value={newNoteInput}
                                        onChange={(e) => setNewNoteInput(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                                    />
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={handleAddInternalNote}
                                        disabled={savingSidebar || !newNoteInput.trim()}
                                        sx={{
                                            height: "28px",
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            textTransform: "none",
                                            bgcolor: "var(--warning)",
                                            color: "#000",
                                            borderRadius: "6px",
                                            width: "100%",
                                            "&:hover": { bgcolor: "var(--warning)" },
                                        }}
                                    >
                                        Post Internal Team Note
                                    </Button>
                                </div>
                            </div>
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