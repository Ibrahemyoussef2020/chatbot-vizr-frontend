import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import {
    HiOutlinePuzzlePiece,
    HiOutlineCodeBracket,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineClipboardDocument,
    HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    fetchWidgetConfig,
    saveWidgetConfig,
    deleteWidgetConfig,
    fetchWidgetEmbedScript,
    type WidgetConfigData,
} from "@/services/integrations/widgetConfig";

const Widget = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    const [allowedDomainsInput, setAllowedDomainsInput] = useState<string>("example.com, localhost");
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [primaryColor, setPrimaryColor] = useState<string>("#2563eb");
    const [welcomeMessage, setWelcomeMessage] = useState<string>("Hello! How can I help you today?");
    const [widgetName, setWidgetName] = useState<string>("Default Widget");
    const [status, setStatus] = useState<"active" | "inactive">("active");

    // Embed Modal state
    const [embedModalOpen, setEmbedModalOpen] = useState<boolean>(false);
    const [embedScript, setEmbedScript] = useState<string>("");
    const [copied, setCopied] = useState<boolean>(false);

    const reloadData = async () => {
        setLoading(true);
        setError("");
        try {
            const data: WidgetConfigData = await fetchWidgetConfig(activeWorkspace?.slug);
            if (data) {
                setWidgetName(data.name || "Default Widget");
                setStatus(data.status || "active");
                setAllowedDomainsInput((data.allowed_domains || []).join(", "));
                setTheme(data.settings?.theme || "light");
                setPrimaryColor(data.settings?.primary_color || "#2563eb");
                setWelcomeMessage(data.settings?.welcome_message || "");
            }
        } catch {
            setError("Failed to load widget settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        fetchWidgetConfig(activeWorkspace?.slug)
            .then((data: WidgetConfigData) => {
                if (isMounted && data) {
                    setWidgetName(data.name || "Default Widget");
                    setStatus(data.status || "active");
                    setAllowedDomainsInput((data.allowed_domains || []).join(", "));
                    setTheme(data.settings?.theme || "light");
                    setPrimaryColor(data.settings?.primary_color || "#2563eb");
                    setWelcomeMessage(data.settings?.welcome_message || "");
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load widget settings.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMsg("");

        const domains = allowedDomainsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const payload: WidgetConfigData = {
            name: widgetName,
            status,
            allowed_domains: domains,
            settings: {
                theme,
                primary_color: primaryColor,
                welcome_message: welcomeMessage,
            },
        };

        try {
            await saveWidgetConfig(activeWorkspace?.slug, payload);
            setSuccessMsg("Widget settings saved successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch {
            setError("Failed to save widget configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleOpenEmbedScript = async () => {
        try {
            const script = await fetchWidgetEmbedScript(activeWorkspace?.slug);
            setEmbedScript(script);
            setEmbedModalOpen(true);
        } catch {
            setError("Failed to fetch widget embed script.");
        }
    };

    const handleCopyScript = () => {
        if (embedScript) {
            void navigator.clipboard.writeText(embedScript);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDeleteWidget = async () => {
        if (!confirm("Are you sure you want to reset widget configuration?")) return;
        setLoading(true);
        try {
            await deleteWidgetConfig(activeWorkspace?.slug);
            setSuccessMsg("Widget configuration reset to default!");
            await reloadData();
        } catch {
            setError("Failed to reset widget.");
        } finally {
            setLoading(false);
        }
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
            <div className="border-b border-border pb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <HiOutlinePuzzlePiece className="text-primary text-xl" />
                    Widget Settings & Branding Customizer
                </h2>

                <div className="flex items-center gap-2">
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<HiOutlineCodeBracket />}
                        onClick={handleOpenEmbedScript}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        Embed Script
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<HiOutlineTrash />}
                        onClick={handleDeleteWidget}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        Reset Widget
                    </Button>
                </div>
            </div>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-xs font-bold">
                    <HiOutlineCheckCircle className="text-lg" />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
                {/* Section 1: Info */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                        Widget Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Widget Name
                            </label>
                            <input
                                type="text"
                                required
                                value={widgetName}
                                onChange={(e) => setWidgetName(e.target.value)}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Allowed Domains (Comma Separated)
                            </label>
                            <input
                                type="text"
                                value={allowedDomainsInput}
                                onChange={(e) => setAllowedDomainsInput(e.target.value)}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                                placeholder="example.com, test.com, localhost"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Branding */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                        Widget Styling & Branding
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Theme
                            </label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            >
                                <option value="light">Light Theme</option>
                                <option value="dark">Dark Theme</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Primary Color Hex
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-9 w-12 cursor-pointer border-0 bg-transparent p-0"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-mono font-semibold uppercase text-foreground focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Welcome Message
                            </label>
                            <textarea
                                rows={2}
                                value={welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                                placeholder="Hello! How can I help you today?"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        variant="contained"
                        sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none", px: 4, py: 1 }}
                    >
                        {saving ? "Saving..." : "Save Widget Config"}
                    </Button>
                </div>
            </form>

            {/* Embed Modal */}
            <Dialog open={embedModalOpen} onClose={() => setEmbedModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>Widget Embed HTML Script</DialogTitle>
                <DialogContent dividers>
                    <p className="text-xs text-muted-foreground mb-3">
                        Copy and paste this snippet into your website HTML right before the closing <code>&lt;/body&gt;</code> tag:
                    </p>
                    <div className="relative">
                        <textarea
                            readOnly
                            rows={6}
                            value={embedScript}
                            className="w-full rounded-xl border border-border bg-surface-muted p-3 text-xs font-mono text-foreground focus:outline-none resize-none"
                        />
                        <button
                            type="button"
                            onClick={handleCopyScript}
                            className="absolute top-2 right-2 rounded-lg bg-card border border-border p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            {copied ? <HiOutlineCheck className="text-emerald-500 text-base" /> : <HiOutlineClipboardDocument className="text-base" />}
                        </button>
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEmbedModalOpen(false)}>Done</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Widget;