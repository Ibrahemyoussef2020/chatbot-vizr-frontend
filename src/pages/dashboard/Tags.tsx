import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import { useEffect, useState, useCallback } from "react";
import {
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import { createTag, updateTag, deleteTag, fetchTags, type TagItem } from "@/services/dashboard/tags";

const bgPresetOptions = [
    { label: "Soft Blue", bg: "#dbeafe", color: "#1d4ed8" },
    { label: "Rose Red", bg: "#fee2e2", color: "#dc2626" },
    { label: "Amber Yellow", bg: "#fef3c7", color: "#d97706" },
    { label: "Emerald Green", bg: "#dcfce7", color: "#15803d" },
    { label: "Purple Violet", bg: "#f3e8ff", color: "#7e22ce" },
    { label: "Cyan Blue", bg: "#cff4fc", color: "#055160" },
    { label: "Slate Gray", bg: "#f1f5f9", color: "#475569" },
    { label: "Fuchsia Pink", bg: "#fae8ff", color: "#a21caf" },
];

const TagsPage = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const [tags, setTags] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal state for Create / Edit
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingTag, setEditingTag] = useState<TagItem | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Form fields
    const [labelInput, setLabelInput] = useState<string>("");
    const [bgInput, setBgInput] = useState<string>("#e0f2fe");
    const [colorInput, setColorInput] = useState<string>("#0369a1");
    const [descriptionInput, setDescriptionInput] = useState<string>("");

    const loadTagsData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchTags(activeWorkspace?.slug);
            setTags(data);
        } catch {
            setError("Failed to load tags from server.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace]);

    useEffect(() => {
        let isMounted = true;
        fetchTags(activeWorkspace?.slug)
            .then((data) => {
                if (isMounted) {
                    setTags(data);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load tags from server.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    const handleOpenCreateModal = () => {
        setEditingTag(null);
        setLabelInput("");
        setBgInput("#e0f2fe");
        setColorInput("#0369a1");
        setDescriptionInput("");
        setModalOpen(true);
    };

    const handleOpenEditModal = (tag: TagItem) => {
        setEditingTag(tag);
        setLabelInput(tag.label || tag.name || "");
        setBgInput(tag.bg || "#e0f2fe");
        setColorInput(tag.color || "#0369a1");
        setDescriptionInput(tag.description || "");
        setModalOpen(true);
    };

    const handleSaveTag = async () => {
        if (!labelInput.trim()) return;

        setSubmitting(true);
        setError("");

        try {
            if (editingTag) {
                await updateTag(editingTag.id, {
                    label: labelInput.trim(),
                    name: labelInput.trim(),
                    bg: bgInput,
                    color: colorInput,
                    description: descriptionInput.trim(),
                });
            } else {
                await createTag({
                    label: labelInput.trim(),
                    name: labelInput.trim(),
                    bg: bgInput,
                    color: colorInput,
                    description: descriptionInput.trim(),
                    systemSlug: activeWorkspace?.slug,
                });
            }

            await loadTagsData();
            setModalOpen(false);
        } catch {
            setError(editingTag ? "Failed to update tag." : "Failed to create tag.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTag = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this tag?")) return;

        try {
            await deleteTag(id);
            setTags((prev) => prev.filter((t) => t.id !== id));
        } catch {
            setError("Failed to delete tag.");
        }
    };

    const filteredTags = tags.filter((t) => {
        const text = searchQuery.toLowerCase();
        return (
            (t.label || t.name || "").toLowerCase().includes(text) ||
            (t.description || "").toLowerCase().includes(text)
        );
    });

    return (
        <div className="mx-auto grid w-full max-w-[1500px] gap-5 p-1">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">CRM Tag Management</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {tags.length} Active Tags
                        </span>
                    </div>
                    <h1 className="mb-1 mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        Conversation Tags & Color Labels
                    </h1>
                    <p className="m-0 text-xs text-muted-foreground sm:text-sm">
                        Create, edit, and delete color-coded tags (`label`, `bg`, `color`) for organizing visitor tickets.
                    </p>
                </div>

                <Button
                    variant="contained"
                    startIcon={<HiOutlinePlus />}
                    onClick={handleOpenCreateModal}
                    sx={{
                        bgcolor: "var(--primary)",
                        color: "#fff",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 2.5,
                    }}
                >
                    Create New Tag
                </Button>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-muted-foreground text-sm" />
                    <input
                        type="text"
                        placeholder="Search tags by label or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                </div>

                <span className="text-xs text-muted-foreground font-semibold">
                    Showing {filteredTags.length} of {tags.length} tags
                </span>
            </div>

            {loading && (
                <div className="flex h-64 items-center justify-center">
                    <CircularProgress size={36} />
                </div>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!loading && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {filteredTags.map((tag) => (
                        <Card
                            key={tag.id}
                            variant="outlined"
                            className="!rounded-2xl !border-border !bg-surface-elevated p-4 flex flex-col justify-between hover:border-primary/50 transition-all"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <Chip
                                        label={tag.label || tag.name}
                                        size="small"
                                        sx={{
                                            bgcolor: tag.bg || "#e0f2fe",
                                            color: tag.color || "#0369a1",
                                            fontWeight: 800,
                                            fontSize: "0.75rem",
                                            height: "26px",
                                            px: 0.5,
                                        }}
                                    />

                                    <div className="flex items-center gap-1">
                                        <Tooltip title="Edit Tag">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditModal(tag)}
                                                className="text-muted-foreground hover:text-primary transition-colors p-1"
                                            >
                                                <HiOutlinePencilSquare className="text-base" />
                                            </button>
                                        </Tooltip>

                                        <Tooltip title="Delete Tag">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTag(tag.id)}
                                                className="text-muted-foreground hover:text-danger transition-colors p-1"
                                            >
                                                <HiOutlineTrash className="text-base" />
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <p className="m-0 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                    {tag.description || "No usage description provided."}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-2.5 text-[11px]">
                                <span className="font-semibold text-primary">{tag.usageCount || 0} conversations</span>
                                <span className="font-mono text-muted-foreground text-[10px]">{tag.systemSlug || "all"}</span>
                            </div>
                        </Card>
                    ))}

                    {filteredTags.length === 0 && (
                        <div className="col-span-full py-16 text-center text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
                            No tags matching your search query.
                        </div>
                    )}
                </div>
            )}

            {/* Create & Edit Modal */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem" }}>
                    {editingTag ? "Edit Conversation Tag" : "Create New Tag"}
                </DialogTitle>

                <DialogContent className="!grid !gap-4 !pt-3">
                    {/* Live Preview */}
                    <div className="rounded-xl border border-border p-3 bg-surface-muted text-center space-y-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            Live Tag Chip Preview
                        </span>
                        <Chip
                            label={labelInput.trim() || "Tag Preview"}
                            size="small"
                            sx={{
                                bgcolor: bgInput,
                                color: colorInput,
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                height: "28px",
                            }}
                        />
                    </div>

                    <TextField
                        autoFocus
                        label="Tag Label Text"
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        required
                        fullWidth
                        placeholder="e.g. VIP Lead, Billing Issue"
                        slotProps={{ htmlInput: { maxLength: 50 } }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                fontSize: "0.8rem",
                                borderRadius: "8px",
                            },
                        }}
                    />

                    <div className="space-y-1.5">
                        <span className="text-xs font-bold text-muted-foreground block">Color Theme Presets</span>
                        <div className="flex flex-wrap gap-1.5">
                            {bgPresetOptions.map((preset) => (
                                <button
                                    type="button"
                                    key={preset.label}
                                    onClick={() => {
                                        setBgInput(preset.bg);
                                        setColorInput(preset.color);
                                    }}
                                    className="rounded-lg px-2 py-1 text-[10px] font-bold border transition-all"
                                    style={{
                                        backgroundColor: preset.bg,
                                        color: preset.color,
                                        borderColor: bgInput === preset.bg ? preset.color : "transparent",
                                    }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <span className="text-[11px] font-bold text-muted-foreground block mb-1">
                                Background Color (`bg`)
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={bgInput}
                                    onChange={(e) => setBgInput(e.target.value)}
                                    className="h-8 w-10 cursor-pointer rounded border border-border p-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={bgInput}
                                    onChange={(e) => setBgInput(e.target.value)}
                                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <span className="text-[11px] font-bold text-muted-foreground block mb-1">
                                Text Color (`color`)
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={colorInput}
                                    onChange={(e) => setColorInput(e.target.value)}
                                    className="h-8 w-10 cursor-pointer rounded border border-border p-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={colorInput}
                                    onChange={(e) => setColorInput(e.target.value)}
                                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs text-foreground font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <TextField
                        label="Description (optional)"
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        multiline
                        rows={2}
                        fullWidth
                        placeholder="Explain when agents should use this tag..."
                        slotProps={{ htmlInput: { maxLength: 200 } }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                fontSize: "0.8rem",
                                borderRadius: "8px",
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setModalOpen(false)} disabled={submitting} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveTag}
                        disabled={submitting || !labelInput.trim()}
                        sx={{
                            bgcolor: "var(--primary)",
                            fontWeight: 700,
                            textTransform: "none",
                            borderRadius: "8px",
                        }}
                    >
                        {submitting ? "Saving…" : editingTag ? "Update Tag" : "Create Tag"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TagsPage;