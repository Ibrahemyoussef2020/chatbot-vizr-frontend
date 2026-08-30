import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    HiOutlinePaperAirplane,
    HiOutlinePlus,
    HiOutlineArrowPath,
    HiOutlineTrash,
    HiOutlineCheckCircle,
    HiOutlineInformationCircle,
    HiOutlineCpuChip,
    HiOutlineKey,
    HiOutlineCog6Tooth,
    HiOutlineBeaker,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    fetchTelegramBots,
    createTelegramBot,
    refreshTelegramWebhook,
    deleteTelegramBot,
    sendTelegramTestMessage,
    type TelegramBotItem,
} from "@/services/integrations/telegramBot";

const TelegramChannel = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const [searchParams, setSearchParams] = useSearchParams();

    // Active View Tab: "platform" | "ai" | "test" | "all"
    const activeTab = searchParams.get("tab") || "all";

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [bots, setBots] = useState<TelegramBotItem[]>([]);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    // Add Bot state
    const [botTokenInput, setBotTokenInput] = useState<string>("");
    const [aiEngineType, setAiEngineType] = useState<"internal_server" | "openai_api">("openai_api");
    const [openaiApiKey, setOpenaiApiKey] = useState<string>("");
    const [internalServerUrl, setInternalServerUrl] = useState<string>("http://localhost:11434/v1");

    // Dedicated Test Dispatcher state
    const [selectedBotId, setSelectedBotId] = useState<string>("");
    const [testChatId, setTestChatId] = useState<string>("");
    const [testMessageText, setTestMessageText] = useState<string>("");
    const [sendingTest, setSendingTest] = useState<boolean>(false);

    // Section Refs for smooth scroll
    const configSectionRef = useRef<HTMLFormElement | null>(null);
    const botsSectionRef = useRef<HTMLDivElement | null>(null);
    const testSectionRef = useRef<HTMLDivElement | null>(null);

    const reloadBots = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchTelegramBots(activeWorkspace?.slug);
            setBots(data);
            if (data.length > 0 && !selectedBotId) {
                setSelectedBotId(data[0].id);
            }
        } catch {
            setError("Failed to load Telegram bots.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        fetchTelegramBots(activeWorkspace?.slug)
            .then((data) => {
                if (isMounted) {
                    setBots(data);
                    if (data.length > 0) setSelectedBotId(data[0].id);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load Telegram bots.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    const handleCreateBot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!botTokenInput.trim() || !activeWorkspace) return;
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            await createTelegramBot({
                system_id: activeWorkspace.id,
                bot_token: botTokenInput.trim(),
                ai_engine_type: aiEngineType,
                openai_api_key: openaiApiKey,
                internal_server_url: internalServerUrl,
            });
            setBotTokenInput("");
            setSuccessMsg("Telegram bot registered and webhook auto-linked!");
            setTimeout(() => setSuccessMsg(""), 3500);
            await reloadBots();
        } catch {
            setError("Failed to register Telegram bot token.");
        } finally {
            setSaving(false);
        }
    };

    const handleRefreshWebhook = async (botId: string) => {
        try {
            await refreshTelegramWebhook(botId);
            setSuccessMsg("Telegram webhook re-registered successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
            await reloadBots();
        } catch {
            setError("Failed to refresh webhook.");
        }
    };

    const handleDeleteBot = async (botId: string) => {
        if (!confirm("Remove this Telegram bot? Webhook will be unlinked.")) return;
        try {
            await deleteTelegramBot(botId);
            setSuccessMsg("Bot removed.");
            setTimeout(() => setSuccessMsg(""), 3500);
            await reloadBots();
        } catch {
            setError("Failed to delete bot.");
        }
    };

    const handleDispatchTestMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetBot = selectedBotId || (bots[0] ? bots[0].id : "");
        if (!targetBot || !testChatId.trim() || !testMessageText.trim()) return;

        setSendingTest(true);
        setError("");
        setSuccessMsg("");
        try {
            const res = await sendTelegramTestMessage(targetBot, testChatId.trim(), testMessageText.trim());
            setTestMessageText("");
            setSuccessMsg(`Telegram test message dispatched to Chat ID ${res.chat_id || testChatId}! (Routed via: ${res.routed_via_ai_engine})`);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to send Telegram test message.";
            setError(msg);
        } finally {
            setSendingTest(false);
        }
    };

    const switchTab = (tabName: string) => {
        setSearchParams({ tab: tabName });
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <CircularProgress size={36} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="border-b border-border pb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500">
                        <HiOutlinePaperAirplane className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                            Telegram Integration Manager
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Dedicated Views for Bot Token Setup, AI Options, and Test Message Dispatcher.
                        </p>
                    </div>
                </div>

                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<HiOutlineArrowPath />}
                    onClick={reloadBots}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
                >
                    Refresh List
                </Button>
            </header>

            {/* Interactive Section Switcher Tabs */}
            <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border">
                <button
                    type="button"
                    onClick={() => switchTab("all")}
                    className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "all" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    📋 Overview All
                </button>

                <button
                    type="button"
                    onClick={() => switchTab("platform")}
                    className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "platform" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <HiOutlineCog6Tooth className="text-base" /> Platform Configs
                </button>

                <button
                    type="button"
                    onClick={() => switchTab("ai")}
                    className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "ai" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <HiOutlineCpuChip className="text-base" /> AI Integration Options
                </button>

                <button
                    type="button"
                    onClick={() => switchTab("test")}
                    className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        activeTab === "test" ? "bg-sky-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <HiOutlineBeaker className="text-base" /> Test Message Dispatcher
                </button>
            </div>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-xs font-bold">
                    <HiOutlineCheckCircle className="text-lg" />
                    {successMsg}
                </div>
            )}

            {/* Setup Instructions Banner */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-black text-sky-500 uppercase tracking-wider">
                    <HiOutlineInformationCircle className="text-base" /> Setup Instructions (@BotFather)
                </div>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 font-medium leading-relaxed">
                    <li>Open Telegram app and search for <strong>@BotFather</strong></li>
                    <li>Send <code>/newbot</code> command and enter your bot name &amp; username</li>
                    <li>Copy the HTTP API Token (format: <code>123456789:ABC-DEF1234ghIkl-zyx...</code>)</li>
                    <li>Paste below — webhook will register automatically to your workspace.</li>
                </ol>
            </div>

            {/* Add Bot Form with Dual AI Engine selection */}
            {(activeTab === "all" || activeTab === "platform" || activeTab === "ai") && (
                <form ref={configSectionRef} onSubmit={handleCreateBot} className="rounded-2xl border-2 border-primary/30 bg-card p-5 space-y-4 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                        <HiOutlinePlus className="text-lg" /> Platform Configurations &amp; AI Integration Options
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                Telegram Bot Token
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="123456789:ABC-DEF1234ghIkl-zyx..."
                                value={botTokenInput}
                                onChange={(e) => setBotTokenInput(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                AI Engine Selection
                            </label>
                            <select
                                value={aiEngineType}
                                onChange={(e) => setAiEngineType(e.target.value as "internal_server" | "openai_api")}
                                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                            >
                                <option value="openai_api">OpenAI / External API Keys</option>
                                <option value="internal_server">Internal AI Agent Microservice</option>
                            </select>
                        </div>
                    </div>

                    {/* AI Configuration specifics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {aiEngineType === "openai_api" ? (
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                                    <HiOutlineKey className="text-primary" /> OpenAI API Key
                                </label>
                                <input
                                    type="password"
                                    placeholder="sk-proj-..."
                                    value={openaiApiKey}
                                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1 flex items-center gap-1">
                                    <HiOutlineCpuChip className="text-emerald-500" /> Internal Inference URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="http://localhost:11434/v1"
                                    value={internalServerUrl}
                                    onChange={(e) => setInternalServerUrl(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border">
                        <Button
                            type="submit"
                            disabled={saving || !botTokenInput.trim()}
                            variant="contained"
                            sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none", px: 4 }}
                        >
                            {saving ? "Registering Token..." : "Save Bot & Link Webhook"}
                        </Button>
                    </div>
                </form>
            )}

            {/* Configured Bots List & Dedicated Test Message Dispatcher */}
            {(activeTab === "all" || activeTab === "test") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Configured Bots List (7 cols) */}
                    <div ref={botsSectionRef} className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                                Configured Telegram Bots ({bots.length})
                            </span>
                            <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-sky-500">
                                {bots.length} Active
                            </span>
                        </div>

                        {bots.length > 0 ? (
                            <div className="space-y-4">
                                {bots.map((bot) => (
                                    <div
                                        key={bot.id}
                                        className="rounded-xl border border-border bg-surface-elevated p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">{bot.bot_name}</span>
                                                {bot.bot_username && (
                                                    <a
                                                        href={`https://t.me/${bot.bot_username}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-500 hover:underline"
                                                    >
                                                        @{bot.bot_username}
                                                    </a>
                                                )}
                                                <span
                                                    className={`rounded px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                                        bot.status === "active"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-warning/10 text-warning"
                                                    }`}
                                                >
                                                    {bot.status}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                System: <strong className="text-foreground">{bot.system.name}</strong> • AI Engine:{" "}
                                                <span className="text-primary font-bold">
                                                    {bot.ai_engine_type === "internal_server" ? "Internal Microservice" : "OpenAI API"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleRefreshWebhook(bot.id)}
                                                sx={{ textTransform: "none", fontSize: "0.7rem" }}
                                            >
                                                Re-register Webhook
                                            </Button>
                                            <button
                                                onClick={() => handleDeleteBot(bot.id)}
                                                className="text-red-500 hover:text-red-600 p-1"
                                            >
                                                <HiOutlineTrash className="text-base" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground italic">
                                No Telegram bots registered yet. Use the form above to add your first bot token.
                            </div>
                        )}
                    </div>

                    {/* Right: Dedicated Telegram Test Message Dispatcher Card (5 cols) */}
                    <div ref={testSectionRef} className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-500 border-b border-border pb-2 flex items-center gap-2">
                                <HiOutlinePaperAirplane className="text-lg" /> Telegram Test Message Dispatcher
                            </h3>

                            <form onSubmit={handleDispatchTestMessage} className="space-y-3 mt-3">
                                {bots.length > 1 && (
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                            Select Bot Token
                                        </label>
                                        <select
                                            value={selectedBotId}
                                            onChange={(e) => setSelectedBotId(e.target.value)}
                                            className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                                        >
                                            {bots.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.bot_name} (@{b.bot_username})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                        Recipient Chat ID (e.g. 123456789)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="123456789"
                                        value={testChatId}
                                        onChange={(e) => setTestChatId(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                        Message Content
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Test message from Telegram Bot..."
                                        value={testMessageText}
                                        onChange={(e) => setTestMessageText(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={sendingTest || !testChatId.trim() || !testMessageText.trim() || bots.length === 0}
                                    variant="contained"
                                    sx={{
                                        width: "100%",
                                        borderRadius: "10px",
                                        fontWeight: 800,
                                        textTransform: "none",
                                        backgroundColor: "#0284c7",
                                        "&:hover": { backgroundColor: "#0369a1" },
                                    }}
                                    startIcon={<HiOutlinePaperAirplane />}
                                >
                                    {sendingTest ? "Sending..." : "Dispatch Message"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TelegramChannel;
