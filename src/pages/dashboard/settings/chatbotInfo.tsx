import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import { HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineArrowPath } from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import { fetchChatbotConfig, updateChatbotConfig, type ChatbotConfigData } from "@/services/core/chatbotConfig";

const ChatbotInfo = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    const [form, setForm] = useState<ChatbotConfigData>({
        id: null,
        name: "",
        webhook_url: "",
        rate_limit: 60,
        is_active: true,
    });

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchChatbotConfig(activeWorkspace?.slug);
            setForm(data);
        } catch {
            setError("Failed to load chatbot configuration from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        fetchChatbotConfig(activeWorkspace?.slug)
            .then((data) => {
                if (isMounted) {
                    setForm(data);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load chatbot configuration from server.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            const updated = await updateChatbotConfig(activeWorkspace?.slug, form);
            setForm(updated);
            setSuccessMsg("Chatbot information updated successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch {
            setError("Failed to update chatbot information.");
        } finally {
            setSaving(false);
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
            {/* Page Title Header */}
            <div className="border-b border-border pb-4 flex items-center justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <HiOutlineInformationCircle className="text-primary text-xl" />
                    Chatbot Info & Workspace System
                </h2>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<HiOutlineArrowPath />}
                    onClick={loadData}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                >
                    Refresh
                </Button>
            </div>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-xs font-bold">
                    <HiOutlineCheckCircle className="text-lg" />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
                <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                        System Name
                    </label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                        placeholder="e.g. Tawasal E-Commerce Bot"
                    />
                </div>

                <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                        Telegram Webhook URL
                    </label>
                    <input
                        type="url"
                        value={form.webhook_url}
                        onChange={(e) => setForm((prev) => ({ ...prev, webhook_url: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                        placeholder="https://api.telegram.org/bot<token>/setWebhook"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                            Rate Limit (req / min)
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={1000}
                            value={form.rate_limit}
                            onChange={(e) => setForm((prev) => ({ ...prev, rate_limit: Number(e.target.value) }))}
                            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <button
                                type="button"
                                onClick={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
                                className={`relative h-6 w-11 rounded-full p-1 transition-colors duration-300 ${
                                    form.is_active ? "bg-emerald-500" : "bg-muted"
                                }`}
                            >
                                <span
                                    className={`block h-4 w-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                        form.is_active ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                            <span className={`text-xs font-bold uppercase tracking-wider ${form.is_active ? "text-emerald-500" : "text-muted-foreground"}`}>
                                {form.is_active ? "Active System" : "Inactive System"}
                            </span>
                        </label>
                    </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        variant="contained"
                        sx={{
                            borderRadius: "10px",
                            fontWeight: 800,
                            textTransform: "none",
                            px: 4,
                            py: 1,
                        }}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChatbotInfo;