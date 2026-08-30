import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    HiOutlinePhone,
    HiOutlineCheckCircle,
    HiOutlineQrCode,
    HiOutlinePaperAirplane,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineCpuChip,
    HiOutlineKey,
    HiOutlineCog6Tooth,
    HiOutlineBeaker,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    fetchWhatsAppConfig,
    saveWhatsAppConfig,
    fetchOpenWAQR,
    createOpenWASession,
    deleteOpenWASession,
    sendWhatsAppTestMessage,
    fetchWhatsAppTemplates,
    fetchWhatsAppConversationStatus,
    type WhatsAppConfigData,
    type WhatsAppSession,
    type WhatsAppTemplate,
    type WhatsAppConversationStatus,
} from "@/services/integrations/whatsappConfig";

const WhatsAppChannel = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const [searchParams, setSearchParams] = useSearchParams();

    // Active View Tab: "platform" | "ai" | "test" | "all"
    const activeTab = searchParams.get("tab") || "all";

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    const [config, setConfig] = useState<WhatsAppConfigData>({
        provider: "meta",
        ai_engine_type: "openai_api",
        internal_server_url: "http://localhost:11434/v1",
        openai_api_key: "",
        whatsapp_app_secret: "",
        whatsapp_phone_number_id: "",
        whatsapp_verify_token: "",
        whatsapp_waba_id: "",
        whatsapp_access_token: "",
        openwa_api_url: "http://localhost:8080",
        openwa_api_key: "",
        openwa_session_id: "main_session",
        sessions: [],
        qr_code_url: "",
    });

    const [newSessionId, setNewSessionId] = useState<string>("");
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

    // Test Message state
    const [testPhone, setTestPhone] = useState<string>("");
    const [testText, setTestText] = useState<string>("");
    const [testMode, setTestMode] = useState<"template" | "text">("template");
    const [customerReplyConfirmed, setCustomerReplyConfirmed] = useState<boolean>(false);
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [selectedTemplateName, setSelectedTemplateName] = useState<string>("hello_world");
    const [templateParameters, setTemplateParameters] = useState<string[]>([]);
    const [conversationStatus, setConversationStatus] = useState<WhatsAppConversationStatus | null>(null);
    const [waitingForReply, setWaitingForReply] = useState<boolean>(false);
    const [sendingTest, setSendingTest] = useState<boolean>(false);

    // Section Refs for smooth scroll
    const aiSectionRef = useRef<HTMLDivElement | null>(null);
    const platformSectionRef = useRef<HTMLFormElement | null>(null);
    const testSectionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetchWhatsAppConfig(activeWorkspace?.slug)
            .then((data) => {
                if (isMounted && data) {
                    setConfig(data);
                    if (data.qr_code_url) setQrCodeUrl(data.qr_code_url);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load WhatsApp configuration.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    useEffect(() => {
        fetchWhatsAppTemplates(activeWorkspace?.slug)
            .then((items) => {
                setTemplates(items);
                if (items.length && !items.some((item) => item.name === selectedTemplateName)) {
                    setSelectedTemplateName(items[0].name);
                }
            })
            .catch(() => setError("Failed to load approved Meta templates."));
    }, [activeWorkspace]);

    useEffect(() => {
        if (!testPhone.trim()) {
            setConversationStatus(null);
            return;
        }
        const checkStatus = () => fetchWhatsAppConversationStatus(testPhone.trim(), activeWorkspace?.slug)
            .then((status) => {
                setConversationStatus(status);
                if (status.replied) {
                    setWaitingForReply(false);
                    setCustomerReplyConfirmed(true);
                    setTestMode("text");
                } else {
                    setCustomerReplyConfirmed(false);
                    setTestMode("template");
                }
            })
            .catch(() => undefined);
        void checkStatus();
        const timer = window.setInterval(checkStatus, 5000);
        return () => window.clearInterval(timer);
    }, [testPhone, activeWorkspace]);

    const selectedTemplate = templates.find((item) => item.name === selectedTemplateName);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            const saved = await saveWhatsAppConfig(activeWorkspace?.slug, config);
            setConfig(saved);
            setSuccessMsg("WhatsApp credentials and AI Engine settings saved!");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch {
            setError("Failed to save WhatsApp configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleFetchQR = async () => {
        try {
            const qr = await fetchOpenWAQR(activeWorkspace?.slug);
            setQrCodeUrl(qr);
            setQrModalOpen(true);
        } catch {
            setError("Failed to fetch OpenWA QR Code.");
        }
    };

    const handleCreateSession = async () => {
        if (!newSessionId.trim()) return;
        try {
            const updatedSessions = await createOpenWASession(activeWorkspace?.slug, newSessionId.trim());
            setConfig((prev) => ({ ...prev, sessions: updatedSessions }));
            setNewSessionId("");
            setSuccessMsg("OpenWA Session created!");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch {
            setError("Failed to create OpenWA session.");
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm(`Delete OpenWA session ${sessionId}?`)) return;
        try {
            const updatedSessions = await deleteOpenWASession(activeWorkspace?.slug, sessionId);
            setConfig((prev) => ({ ...prev, sessions: updatedSessions }));
            setSuccessMsg("Session deleted.");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch {
            setError("Failed to delete session.");
        }
    };

    const handleSendTestMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testPhone.trim()) return;
        if (testMode === "text" && (!customerReplyConfirmed || !testText.trim())) {
            setError("Confirm that the customer replied within the last 24 hours before sending a custom message.");
            return;
        }
        setSendingTest(true);
        setError("");
        setSuccessMsg("");

        try {
            const res = await sendWhatsAppTestMessage(
                testPhone.trim(),
                testText.trim(),
                activeWorkspace?.slug,
                testMode,
                selectedTemplate?.name || "hello_world",
                selectedTemplate?.language || "en_US",
                templateParameters,
            );
            setTestText("");
            if (testMode === "template") {
                setWaitingForReply(true);
                setCustomerReplyConfirmed(false);
            }
            setSuccessMsg(
                `Meta accepted the ${res.mode || testMode} message for ${res.phone || testPhone}. ` +
                "Delivery will be confirmed by the WhatsApp delivery webhook.",
            );
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to send WhatsApp test message.";
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                        <HiOutlinePhone className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                            WhatsApp Integration Manager
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Dedicated Views for Platform Credentials, Dual AI Engine Options, and Test Messaging.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HiOutlineQrCode />}
                        onClick={handleFetchQR}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
                    >
                        Show QR Code
                    </Button>
                </div>
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
                        activeTab === "test" ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <HiOutlineBeaker className="text-base" /> Test Signal &amp; Sessions
                </button>
            </div>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-xs font-bold">
                    <HiOutlineCheckCircle className="text-lg" />
                    {successMsg}
                </div>
            )}

            {/* TAB 1 / SECTION: AI Integration Options */}
            {(activeTab === "all" || activeTab === "ai") && (
                <div ref={aiSectionRef} className="rounded-2xl border-2 border-primary/30 bg-card p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <HiOutlineCpuChip className="text-lg" />
                            AI Engine Response Routing (Dual Integration Mode)
                        </h3>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary">
                            Active Engine: {config.ai_engine_type === "internal_server" ? "Internal Microservice" : "OpenAI API"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                            onClick={() => setConfig((prev) => ({ ...prev, ai_engine_type: "openai_api" }))}
                            className={`flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                                config.ai_engine_type === "openai_api"
                                    ? "border-primary bg-primary/10 text-foreground"
                                    : "border-border bg-surface-muted hover:border-primary/50"
                            }`}
                        >
                            <div className="flex items-center gap-2 font-bold text-xs">
                                <HiOutlineKey className="text-primary text-base" />
                                <span>OpenAI / External API Keys</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Routes WhatsApp incoming messages to cloud LLM providers (GPT-4o, Claude 3.5, Gemini) using API key authorization.
                            </p>
                            {config.ai_engine_type === "openai_api" && (
                                <input
                                    type="password"
                                    placeholder="sk-proj-..."
                                    value={config.openai_api_key || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, openai_api_key: e.target.value }))}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none mt-1"
                                />
                            )}
                        </label>

                        <label
                            onClick={() => setConfig((prev) => ({ ...prev, ai_engine_type: "internal_server" }))}
                            className={`flex flex-col gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                                config.ai_engine_type === "internal_server"
                                    ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                                    : "border-border bg-surface-muted hover:border-emerald-500/50"
                            }`}
                        >
                            <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                                <HiOutlineCpuChip className="text-base" />
                                <span>Internal AI Agent Microservice</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Routes WhatsApp prompts to self-hosted internal LLM inference servers (Ollama, vLLM, LMStudio) over private LAN.
                            </p>
                            {config.ai_engine_type === "internal_server" && (
                                <input
                                    type="url"
                                    placeholder="http://localhost:11434/v1"
                                    value={config.internal_server_url || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, internal_server_url: e.target.value }))}
                                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground focus:border-emerald-500 focus:outline-none mt-1"
                                />
                            )}
                        </label>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border">
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            variant="contained"
                            sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none", px: 4 }}
                        >
                            {saving ? "Saving..." : "Save AI Integration Options"}
                        </Button>
                    </div>
                </div>
            )}

            {/* TAB 2 / SECTION: Platform Configurations */}
            {(activeTab === "all" || activeTab === "platform") && (
                <form ref={platformSectionRef} onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-5 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <HiOutlineCog6Tooth className="text-primary text-base" /> Platform Configurations &amp; Gateway Credentials
                        </span>
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                <input
                                    type="radio"
                                    name="provider"
                                    value="meta"
                                    checked={config.provider === "meta"}
                                    onChange={() => setConfig((prev) => ({ ...prev, provider: "meta" }))}
                                    className="accent-primary"
                                />
                                Meta Cloud API (Official)
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                <input
                                    type="radio"
                                    name="provider"
                                    value="openwa"
                                    checked={config.provider === "openwa"}
                                    onChange={() => setConfig((prev) => ({ ...prev, provider: "openwa" }))}
                                    className="accent-primary"
                                />
                                OpenWA API Gateway (Self-Hosted)
                            </label>
                        </div>
                    </div>

                    {config.provider === "meta" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    App Secret
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsapp_app_secret || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_app_secret: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    Phone Number ID
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsapp_phone_number_id || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_phone_number_id: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    Verify Token
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsapp_verify_token || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_verify_token: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    WABA ID
                                </label>
                                <input
                                    type="text"
                                    value={config.whatsapp_waba_id || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_waba_id: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    System User Access Token
                                </label>
                                <textarea
                                    rows={2}
                                    value={config.whatsapp_access_token || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_access_token: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    Gateway URL
                                </label>
                                <input
                                    type="url"
                                    value={config.openwa_api_url || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, openwa_api_url: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                    Gateway API Key
                                </label>
                                <input
                                    type="text"
                                    value={config.openwa_api_key || ""}
                                    onChange={(e) => setConfig((prev) => ({ ...prev, openwa_api_key: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-2 border-t border-border">
                        <Button
                            type="submit"
                            disabled={saving}
                            variant="contained"
                            sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none", px: 4 }}
                        >
                            {saving ? "Saving..." : "Save Platform Configurations"}
                        </Button>
                    </div>
                </form>
            )}

            {/* TAB 3 / SECTION: Sessions & Test Message Dispatcher */}
            {(activeTab === "all" || activeTab === "test") && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: OpenWA Sessions List (7 cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                                Active Gateway Sessions ({(config.sessions || []).length})
                            </span>

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Session ID..."
                                    value={newSessionId}
                                    onChange={(e) => setNewSessionId(e.target.value)}
                                    className="w-28 rounded-lg border border-border bg-surface-muted px-2.5 py-1 text-xs text-foreground focus:outline-none"
                                />
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<HiOutlinePlus />}
                                    onClick={handleCreateSession}
                                    sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 700 }}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-surface-muted uppercase font-bold text-muted-foreground">
                                    <tr>
                                        <th className="p-2.5">Session ID</th>
                                        <th className="p-2.5 text-center">Status</th>
                                        <th className="p-2.5 text-center">Phone</th>
                                        <th className="p-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {(config.sessions || []).map((sess: WhatsAppSession) => (
                                        <tr key={sess.session_id} className="hover:bg-surface-muted/30 transition-colors">
                                            <td className="p-2.5 font-mono font-bold text-foreground">{sess.session_id}</td>
                                            <td className="p-2.5 text-center">
                                                <span
                                                    className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                                        sess.status === "connected"
                                                            ? "bg-emerald-500/10 text-emerald-500"
                                                            : "bg-warning/10 text-warning"
                                                    }`}
                                                >
                                                    {sess.status}
                                                </span>
                                            </td>
                                            <td className="p-2.5 text-center font-mono text-muted-foreground">{sess.phone || "N/A"}</td>
                                            <td className="p-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button size="small" variant="outlined" onClick={handleFetchQR} sx={{ fontSize: "0.68rem" }}>
                                                        QR
                                                    </Button>
                                                    <button
                                                        onClick={() => handleDeleteSession(sess.session_id)}
                                                        className="text-red-500 hover:text-red-600 p-1"
                                                    >
                                                        <HiOutlineTrash className="text-base" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Test Message Sender (5 cols) */}
                    <div ref={testSectionRef} className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-2 flex items-center gap-2">
                                <HiOutlineBeaker className="text-lg text-emerald-500" /> WhatsApp Test Message Dispatcher
                            </h3>

                            <form onSubmit={handleSendTestMessage} className="space-y-3 mt-3">
                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                        Recipient Phone (e.g. 201554605666)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="201554605666"
                                        value={testPhone}
                                        onChange={(e) => {
                                            setTestPhone(e.target.value);
                                            setCustomerReplyConfirmed(false);
                                            setWaitingForReply(false);
                                            setTestMode("template");
                                        }}
                                        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {!conversationStatus?.replied && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-extrabold uppercase text-muted-foreground">
                                            Ready Message Template
                                        </label>
                                        <select
                                            value={selectedTemplateName}
                                            onChange={(e) => {
                                                setSelectedTemplateName(e.target.value);
                                                const template = templates.find((item) => item.name === e.target.value);
                                                setTemplateParameters(Array(template?.parameter_count || 0).fill(""));
                                            }}
                                            className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                                        >
                                            {templates.map((template) => (
                                                <option key={`${template.name}-${template.language}`} value={template.name}>
                                                    {template.name.replaceAll("_", " ")} ({template.category.toLowerCase()})
                                                </option>
                                            ))}
                                        </select>
                                        {selectedTemplate && (
                                            <div className="rounded-lg border border-border bg-surface-elevated p-2 text-[10px] text-muted-foreground whitespace-pre-line">
                                                {selectedTemplate.body}
                                            </div>
                                        )}
                                        {Array.from({ length: selectedTemplate?.parameter_count || 0 }, (_, index) => (
                                            <input
                                                key={index}
                                                required
                                                value={templateParameters[index] || ""}
                                                onChange={(e) => setTemplateParameters((current) => {
                                                    const next = [...current];
                                                    next[index] = e.target.value;
                                                    return next;
                                                })}
                                                placeholder={`Template value {{${index + 1}}}`}
                                                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                                            />
                                        ))}
                                    </div>
                                )}

                                {!conversationStatus?.replied && waitingForReply && (
                                    <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600">
                                        <span className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-amber-400 ring-4 ring-amber-400/20" />
                                        <span><strong>Waiting for customer response.</strong> Custom messaging unlocks automatically after their reply.</span>
                                    </div>
                                )}

                                {conversationStatus?.replied && (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">
                                        <div className="flex items-center gap-2 font-bold">
                                            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Customer replied — custom messaging is active
                                        </div>
                                        {conversationStatus.latest_message && (
                                            <div className="mt-2 rounded-lg bg-card p-2 text-foreground">
                                                “{conversationStatus.latest_message}”
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                        Message Content
                                    </label>
                                    <textarea
                                        rows={3}
                                        required={testMode === "text"}
                                        disabled={!conversationStatus?.replied}
                                        placeholder={conversationStatus?.replied ? "Write a custom message..." : "Available after the customer replies"}
                                        value={testText}
                                        onChange={(e) => setTestText(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={
                                        sendingTest ||
                                        !testPhone.trim() ||
                                        (testMode === "text" && (!customerReplyConfirmed || !testText.trim()))
                                    }
                                    variant="contained"
                                    color="success"
                                    startIcon={<HiOutlinePaperAirplane />}
                                    sx={{ width: "100%", borderRadius: "10px", fontWeight: 800, textTransform: "none" }}
                                >
                                    {sendingTest
                                        ? "Sending..."
                                        : testMode === "template"
                                            ? "Send Approved Template"
                                            : "Send Custom Message"}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Dialog */}
            <Dialog open={qrModalOpen} onClose={() => setQrModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Link Phone via QR Code</DialogTitle>
                <DialogContent dividers className="flex flex-col items-center p-6 space-y-3">
                    {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="WhatsApp QR Code" className="h-48 w-48 rounded-xl border border-border shadow-md" />
                    ) : (
                        <CircularProgress size={32} />
                    )}
                    <p className="text-center text-xs text-muted-foreground">
                        Scan from WhatsApp -&gt; Linked Devices to authorize OpenWA gateway session.
                    </p>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setQrModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default WhatsAppChannel;
