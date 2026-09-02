import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, type MouseEvent } from "react";
import { HiBookmark, HiChevronDown, HiOutlineArrowDownTray, HiOutlineArrowLeft, HiOutlineArrowPath, HiOutlineBookmark, HiOutlineClipboardDocument, HiOutlineCodeBracket, HiOutlineDocumentText, HiOutlineLink, HiOutlineShare, HiOutlineXMark } from "react-icons/hi2";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { GeneratedOutput } from "@/services/knowledge/generatedOutputs";
import type { GeneratedOutputKind } from "@/hooks/useGeneratedOutput";

interface Props { output: GeneratedOutput; sessionTitle: string; kind: GeneratedOutputKind; action: string; onToggleSaved: () => Promise<void>; onRegenerate: () => Promise<void>; onShare: () => Promise<string | undefined>; onUnshare: () => Promise<void>; }
const menuPaper = { sx: { mt: 0.5, minWidth: 190, color: "var(--foreground)", backgroundColor: "var(--surface-elevated)", backgroundImage: "none", border: "1px solid var(--border)", borderRadius: "10px", boxShadow: "var(--shadow)", ".MuiMenuItem-root": { gap: 1.25, fontSize: 13, fontWeight: 700, "&:hover, &.Mui-focusVisible": { backgroundColor: "var(--surface-muted)" } } } };
const safeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const download = (name: string, content: string, type: string) => { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); };
const markdown = (output: GeneratedOutput) => [`# ${output.title}`, "", output.description, "", ...output.sections.flatMap((section) => [`## ${section.title}`, "", section.description, "", ...section.notes.flatMap((note) => [`### ${note.title}`, note.description, note.meta || "", ""]), ...section.charts.flatMap((chart) => [`### ${chart.title}`, chart.description || "", ...chart.items.map((item) => `- ${item.label}: ${item.value}${item.detail ? ` (${item.detail})` : ""}`), ""]), ""])].join("\n");
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character));

const OutputHeader = ({ output, sessionTitle, kind, action, onToggleSaved, onRegenerate, onShare, onUnshare }: Props) => {
    const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
    const [shareAnchor, setShareAnchor] = useState<HTMLElement | null>(null);
    const baseName = safeName(output.title) || output.kind;
    const exportAs = (format: "json" | "markdown" | "pdf") => {
        setExportAnchor(null);
        if (format === "json") download(`${baseName}.json`, JSON.stringify(output, null, 2), "application/json");
        if (format === "markdown") download(`${baseName}.md`, markdown(output), "text/markdown");
        if (format === "pdf") {
            const popup = window.open("", "_blank");
            if (!popup) return void toast.error("Allow popups to export as PDF.");
            popup.opener = null;
            const sections = output.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p>${section.notes.map((note) => `<article><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.description)}</p></article>`).join("")}${section.charts.map((chart) => `<article><h3>${escapeHtml(chart.title)}</h3>${chart.description ? `<p>${escapeHtml(chart.description)}</p>` : ""}<ul>${chart.items.map((item) => `<li>${escapeHtml(item.label)}: ${item.value}${item.detail ? ` — ${escapeHtml(item.detail)}` : ""}</li>`).join("")}</ul></article>`).join("")}</section>`).join("");
            popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(output.title)}</title><style>@page{margin:16mm}body{font:14px/1.6 system-ui;max-width:900px;margin:40px auto;color:#17202a}h1{font-size:30px}h2{margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:8px}section{break-before:auto}article{break-inside:avoid;margin:14px 0;padding:12px;border:1px solid #ddd;border-radius:8px}@media print{body{max-width:none;margin:0}}</style></head><body><h1>${escapeHtml(output.title)}</h1><p>${escapeHtml(output.description)}</p>${sections}</body></html>`);
            popup.document.close();
            popup.focus();
            window.setTimeout(() => popup.print(), 250);
        }
        toast.success(format === "pdf" ? "Print dialog opened" : `${format} exported`);
    };
    const regenerate = () => { if (window.confirm(`Regenerate every schema in this ${kind}? Existing generated content will be replaced.`)) void onRegenerate(); };
    const buttonClass = "inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground transition hover:border-primary hover:text-primary disabled:opacity-50";

    return <header className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8"><div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" /><div className="relative">
        <Link to={`/dashboard/knowledge/${kind === "plan" ? "plans" : "reports"}`} className="mb-5 inline-flex items-center gap-1 text-xs font-bold text-primary no-underline"><HiOutlineArrowLeft /> Choose another session</Link>
        <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-3xl"><div className="mb-3 flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-wide"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{output.category}</span><span className="rounded-full bg-success/10 px-2.5 py-1 text-success">{output.status}</span>{output.isSaved && <span className="rounded-full bg-warning/10 px-2.5 py-1 text-warning">Saved</span>}</div><h1 className="m-0 text-3xl font-extrabold tracking-tight text-foreground">{output.title}</h1><p className="mb-4 mt-2 text-sm leading-6 text-muted-foreground">{output.description}</p><p className="m-0 text-xs text-muted-foreground"><b className="text-foreground">Session:</b> {sessionTitle} · {new Date(output.createdAt).toLocaleDateString()} · {output.id}</p></div>
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={(event: MouseEvent<HTMLButtonElement>) => setExportAnchor(event.currentTarget)} className={buttonClass}><HiOutlineArrowDownTray className="text-base" /> Export <HiChevronDown /></button>
                <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)} slotProps={{ paper: menuPaper }}><MenuItem onClick={() => exportAs("pdf")}><HiOutlineDocumentText /> PDF / Print</MenuItem><MenuItem onClick={() => exportAs("markdown")}><HiOutlineClipboardDocument /> Markdown</MenuItem><MenuItem onClick={() => exportAs("json")}><HiOutlineCodeBracket /> JSON</MenuItem></Menu>
                <button type="button" disabled={Boolean(action)} onClick={(event: MouseEvent<HTMLButtonElement>) => setShareAnchor(event.currentTarget)} className={buttonClass}><HiOutlineShare className="text-base" />{action === "share" ? "Sharing..." : "Share"}<HiChevronDown /></button>
                <Menu anchorEl={shareAnchor} open={Boolean(shareAnchor)} onClose={() => setShareAnchor(null)} slotProps={{ paper: menuPaper }}><MenuItem onClick={() => { setShareAnchor(null); void onShare(); }}><HiOutlineLink /> {output.isShared ? "Copy share link" : "Create share link"}</MenuItem>{output.isShared && <MenuItem onClick={() => { setShareAnchor(null); void onUnshare(); }} sx={{ color: "var(--danger) !important" }}><HiOutlineXMark /> Disable sharing</MenuItem>}</Menu>
                <button type="button" disabled={Boolean(action)} onClick={regenerate} className={buttonClass}><HiOutlineArrowPath className={action === "regenerate" ? "animate-spin text-base" : "text-base"} />{action === "regenerate" ? "Regenerating..." : "Regenerate"}</button>
                <button type="button" disabled={Boolean(action)} onClick={() => void onToggleSaved()} className={`${buttonClass} ${output.isSaved ? "!border-warning/40 !bg-warning/10 !text-warning" : ""}`}>{output.isSaved ? <HiBookmark className="text-base" /> : <HiOutlineBookmark className="text-base" />}{action === "save" ? "Saving..." : output.isSaved ? "Saved" : "Save"}</button>
            </div>
        </div>
    </div></header>;
};
export default OutputHeader;
