import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import {
    HiOutlineCog6Tooth,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineDocumentText,
    HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import { fetchAIConfig, saveAIConfig, type AIConfigData } from "@/services/aiConfig";

const Configs = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    const [form, setForm] = useState<AIConfigData>({
        company_name: "My Company LLC",
        assistant_name: "AI Assistant",
        contact_email: "support@company.com",
        website_url: "https://company.com",
        contact_us_link: "https://company.com/contact",
        company_description: "We provide digital & AI solution services.",
        tone_instructions: "Be helpful, polite, professional, and concise.",
        pricing_instructions: "Share standard tier information.",
        language_notes: "Supports English, Arabic, and French.",
        contact_collection_rules: "Collect name, email, phone number, and inquiry.",
        actions_data: [],
        uploaded_files: [],
    });

    useEffect(() => {
        let isMounted = true;

        fetchAIConfig(activeWorkspace?.slug)
            .then((data) => {
                if (isMounted && data) {
                    setForm(data);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load AI Website Configurations.");
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

        try {
            const saved = await saveAIConfig(activeWorkspace?.slug, form);
            setForm(saved);
            setSuccessMsg("Website AI Configuration saved successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
        } catch {
            setError("Failed to save AI configuration.");
        } finally {
            setSaving(false);
        }
    };

    const addActionItem = () => {
        setForm((prev) => ({
            ...prev,
            actions_data: [...(prev.actions_data || []), { action: "", link: "", description: "" }],
        }));
    };

    const removeActionItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            actions_data: (prev.actions_data || []).filter((_, i) => i !== index),
        }));
    };

    const updateActionItem = (index: number, field: "action" | "link" | "description", val: string) => {
        setForm((prev) => {
            const updated = [...(prev.actions_data || [])];
            updated[index] = { ...updated[index], [field]: val };
            return { ...prev, actions_data: updated };
        });
    };

    const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files).map((f) => ({
            name: f.name,
            url: `https://cdn.example.com/docs/${f.name}`,
            size: f.size,
        }));

        setForm((prev) => ({
            ...prev,
            uploaded_files: [...(prev.uploaded_files || []), ...newFiles],
        }));

        e.target.value = "";
    };

    const removeUploadedFile = (index: number) => {
        setForm((prev) => ({
            ...prev,
            uploaded_files: (prev.uploaded_files || []).filter((_, i) => i !== index),
        }));
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
            <header className="border-b border-border pb-4">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
                    <HiOutlineCog6Tooth className="text-primary text-xl" />
                    AI Website Rules & Identity Configurations
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Configure your business identity, system prompt rules, pricing guidance, knowledge PDFs, and quick actions.
                </p>
            </header>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-xs font-bold">
                    <HiOutlineCheckCircle className="text-lg" />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
                {/* Section 1: Identity */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                        Identity & Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Company Name
                            </label>
                            <input
                                type="text"
                                required
                                value={form.company_name}
                                onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Assistant Name
                            </label>
                            <input
                                type="text"
                                value={form.assistant_name}
                                onChange={(e) => setForm((prev) => ({ ...prev, assistant_name: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={form.contact_email}
                                onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Website URL
                            </label>
                            <input
                                type="url"
                                value={form.website_url}
                                onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Contact Us Page Link
                            </label>
                            <input
                                type="url"
                                value={form.contact_us_link}
                                onChange={(e) => setForm((prev) => ({ ...prev, contact_us_link: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-mono font-semibold text-foreground focus:border-primary focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: AI Context & Rules */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                        AI Rules & Context Instructions
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Company Description
                            </label>
                            <textarea
                                rows={3}
                                value={form.company_description}
                                onChange={(e) => setForm((prev) => ({ ...prev, company_description: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Tone Instructions
                            </label>
                            <textarea
                                rows={3}
                                value={form.tone_instructions}
                                onChange={(e) => setForm((prev) => ({ ...prev, tone_instructions: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Pricing Instructions
                            </label>
                            <textarea
                                rows={3}
                                value={form.pricing_instructions}
                                onChange={(e) => setForm((prev) => ({ ...prev, pricing_instructions: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Contact Collection Rules
                            </label>
                            <textarea
                                rows={3}
                                value={form.contact_collection_rules}
                                onChange={(e) => setForm((prev) => ({ ...prev, contact_collection_rules: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Knowledge Documents */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border pb-1">
                        Knowledge Base PDF Documents
                    </h3>

                    <div>
                        <input
                            type="file"
                            multiple
                            accept=".pdf"
                            onChange={handleFileUploadSimulated}
                            className="w-full rounded-xl border border-border bg-card p-2 text-xs text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                        />

                        {form.uploaded_files && form.uploaded_files.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {form.uploaded_files.map((file, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-3.5 py-2 text-xs"
                                    >
                                        <div className="flex items-center gap-2 font-semibold text-foreground">
                                            <HiOutlineDocumentText className="text-primary text-base" />
                                            <span>{file.name}</span>
                                            <span className="text-[10px] text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeUploadedFile(i)}
                                            className="text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            <HiOutlineTrash className="text-base" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 4: Actions Data */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Actions Data</h3>
                        <Button
                            size="small"
                            startIcon={<HiOutlinePlus />}
                            onClick={addActionItem}
                            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.75rem" }}
                        >
                            Add Action
                        </Button>
                    </div>

                    {form.actions_data && form.actions_data.length > 0 ? (
                        <div className="space-y-3">
                            {form.actions_data.map((act, idx) => (
                                <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-3 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeActionItem(idx)}
                                        className="absolute top-3 right-3 text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        <HiOutlineTrash className="text-base" />
                                    </button>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                                Action Name
                                            </label>
                                            <input
                                                type="text"
                                                value={act.action}
                                                onChange={(e) => updateActionItem(idx, "action", e.target.value)}
                                                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                                Action Link
                                            </label>
                                            <input
                                                type="url"
                                                value={act.link}
                                                onChange={(e) => updateActionItem(idx, "link", e.target.value)}
                                                className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={act.description}
                                            onChange={(e) => updateActionItem(idx, "description", e.target.value)}
                                            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground italic">
                            No quick actions defined. Click "Add Action" to create one.
                        </div>
                    )}
                </div>

                <div className="border-t border-border pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        variant="contained"
                        sx={{ borderRadius: "10px", fontWeight: 800, textTransform: "none", px: 4, py: 1 }}
                    >
                        {saving ? "Saving..." : "Save AI Website Config"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Configs;
