import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import { useState, type FormEvent, type MouseEvent } from "react";
import { HiChevronDown, HiOutlineArrowPath, HiOutlinePencilSquare, HiOutlineSparkles, HiOutlineTrash } from "react-icons/hi2";
import type { EditMode } from "@/services/knowledge/knowledgeOutputs";
import type { GeneratedSection, GeneratedSectionInput } from "@/services/knowledge/generatedOutputs";

interface Props {
    section: GeneratedSection;
    busy: boolean;
    onRetry: () => Promise<void>;
    onEdit: (mode: EditMode, payload: GeneratedSectionInput | { instruction: string }) => Promise<void>;
    onRemove: () => Promise<void>;
}

const fieldSx = {
    ".MuiInputLabel-root": { color: "var(--muted-foreground)" },
    ".MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
    ".MuiInputBase-root": { color: "var(--foreground)", backgroundColor: "var(--surface-muted)" },
    ".MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--input)" },
    ".Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--primary) !important" },
    "textarea::placeholder, input::placeholder": { color: "var(--muted-foreground)", opacity: 1 },
};

const SectionActions = ({ section, busy, onRetry, onEdit, onRemove }: Props) => {
    const [mode, setMode] = useState<EditMode | null>(null);
    const [editAnchor, setEditAnchor] = useState<HTMLElement | null>(null);
    const chooseMode = (nextMode: EditMode) => {
        setEditAnchor(null);
        setMode(nextMode);
    };
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        if (mode === "ai") await onEdit("ai", { instruction: String(data.get("instruction") || "") });
        if (mode === "manual") await onEdit("manual", { title: String(data.get("title") || ""), description: String(data.get("description") || ""), notes: section.notes, charts: section.charts });
        setMode(null);
    };

    return <>
        <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} aria-haspopup="menu" aria-expanded={Boolean(editAnchor)} onClick={(event: MouseEvent<HTMLButtonElement>) => setEditAnchor(event.currentTarget)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"><HiOutlinePencilSquare className="text-sm" /> Edit <HiChevronDown className="text-xs" /></button>
            <Menu anchorEl={editAnchor} open={Boolean(editAnchor)} onClose={() => setEditAnchor(null)} slotProps={{ paper: { sx: { mt: 0.5, minWidth: 190, color: "var(--foreground)", backgroundColor: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "var(--shadow)", backgroundImage: "none", ".MuiMenuItem-root": { color: "var(--foreground)", "&:hover, &.Mui-focusVisible": { backgroundColor: "var(--surface-muted)" } } } } }}>
                <MenuItem onClick={() => chooseMode("ai")} sx={{ gap: 1.25, fontSize: 13, fontWeight: 700 }}><HiOutlineSparkles style={{ color: "var(--primary)" }} className="text-base" /> Edit with AI</MenuItem>
                <MenuItem onClick={() => chooseMode("manual")} sx={{ gap: 1.25, fontSize: 13, fontWeight: 700 }}><HiOutlinePencilSquare style={{ color: "var(--muted-foreground)" }} className="text-base" /> Edit manually</MenuItem>
            </Menu>
            <Tooltip title="Regenerate this schema">
                <span><button type="button" disabled={busy} aria-label="Regenerate this schema" onClick={() => void onRetry()} className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-border bg-background text-primary transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"><HiOutlineArrowPath className={busy ? "animate-spin text-base" : "text-base"} /></button></span>
            </Tooltip>
            <button type="button" disabled={busy} onClick={() => { if (window.confirm(`Remove ${section.title}?`)) void onRemove(); }} className="inline-flex items-center gap-1 rounded-lg border border-danger/20 bg-danger/5 px-2.5 py-1.5 text-xs font-bold text-danger"><HiOutlineTrash /> Remove</button>
        </div>
        <Dialog open={mode !== null} onClose={() => !busy && setMode(null)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { color: "var(--foreground)", backgroundColor: "var(--surface)", backgroundImage: "none", border: "1px solid var(--border)" } }, backdrop: { sx: { backgroundColor: "color-mix(in srgb, var(--background) 72%, transparent)" } } }}>
            <form onSubmit={submit}>
                <DialogTitle sx={{ fontWeight: 800 }}>{mode === "ai" ? "Edit schema with AI" : "Edit schema manually"}</DialogTitle>
                <DialogContent className="!grid !gap-4 !pt-2">
                    {mode === "ai" ? <TextField name="instruction" label="Editing instruction" placeholder="Explain what should change in this section..." multiline minRows={4} required sx={fieldSx} /> : <><TextField name="title" label="Section title" defaultValue={section.title} required sx={fieldSx} /><TextField name="description" label="Section description" defaultValue={section.description} multiline minRows={5} required sx={fieldSx} /><p className="m-0 text-xs text-muted-foreground">Notes and charts are preserved by this quick editor. Their structured editors can use the same manual endpoint.</p></>}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setMode(null)} disabled={busy}>Cancel</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? "Saving..." : "Save changes"}</Button></DialogActions>
            </form>
        </Dialog>
    </>;
};

export default SectionActions;
