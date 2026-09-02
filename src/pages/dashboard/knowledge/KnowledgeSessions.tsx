import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { HiOutlineArrowRight, HiOutlineBookOpen, HiOutlineClock, HiOutlineDocumentText, HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineRectangleStack } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { createSession, listSessions, type KnowledgeSession, type KnowledgeStatus } from "@/services/knowledge/knowledgeBase";

interface Props { mode?: "sessions" | "upload" | "chat" | "plans" | "reports"; }

const pageContent = {
    sessions: { eyebrow: "Knowledge workspace", title: "Your knowledge sessions", description: "Continue a previous conversation or create a focused space for new knowledge.", action: "Continue chat", hash: "#chat" },
    upload: { eyebrow: "Add knowledge", title: "Choose an upload session", description: "Select where your new files belong, so every answer keeps the right context.", action: "Upload files", hash: "#sources" },
    chat: { eyebrow: "Ask your knowledge", title: "Choose a conversation", description: "Open a session and ask questions grounded in its ready sources.", action: "Open chat", hash: "#chat" },
    plans: { eyebrow: "Knowledge planning", title: "Choose a session plan", description: "Open the execution plan connected to a knowledge session.", action: "View plan", hash: "/plans" },
    reports: { eyebrow: "Knowledge insights", title: "Choose a session report", description: "Review activity, answer quality, topics, and gaps for a knowledge session.", action: "View report", hash: "/reports" },
} as const;

const statusLabels: Record<KnowledgeStatus, string> = { empty: "Empty", processing: "Processing", ready: "Ready", partial: "Partially ready", failed: "Needs attention" };
const statusStyles: Record<KnowledgeStatus, string> = { empty: "bg-muted/70 text-muted-foreground", processing: "bg-warning/15 text-warning", ready: "bg-success/15 text-success", partial: "bg-primary/15 text-primary", failed: "bg-danger/15 text-danger" };

const formatUpdatedAt = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Recently updated";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const KnowledgeSessions = ({ mode = "sessions" }: Props) => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<KnowledgeSession[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(Boolean(workspace?.slug));
    const [creating, setCreating] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");
    const content = pageContent[mode];

    useEffect(() => {
        if (!workspace?.slug) return;
        listSessions(workspace.slug).then(setSessions).catch(() => setError("Knowledge sessions could not be loaded.")).finally(() => setLoading(false));
    }, [workspace?.slug]);

    const visibleSessions = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();
        return normalizedQuery ? sessions.filter((session) => session.title.toLocaleLowerCase().includes(normalizedQuery)) : sessions;
    }, [query, sessions]);

    const create = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!workspace?.slug) return;
        setCreating(true);
        setError("");
        try {
            const title = String(new FormData(event.currentTarget).get("title") || "").trim();
            const session = await createSession(workspace.slug, title);
            navigate(`/dashboard/knowledge/${session.id}${content.hash}`);
        } catch { setError("The knowledge session could not be created."); }
        finally { setCreating(false); }
    };

    return (
        <div className="mx-auto grid w-full max-w-[1400px] gap-5 p-2">
            <section className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-2xl">
                        <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-primary">{content.eyebrow}</span>
                        <h1 className="mb-1 mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">{content.title}</h1>
                        <p className="m-0 max-w-xl text-sm leading-5 text-muted-foreground">{content.description}</p>
                    </div>
                    <Button variant="contained" startIcon={<HiOutlinePlus />} onClick={() => setOpen(true)} sx={{ borderRadius: "10px", px: 2, py: 0.85, fontWeight: 800, textTransform: "none" }}>New session</Button>
                </div>
            </section>

            <section aria-labelledby="sessions-heading" className="grid gap-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 id="sessions-heading" className="m-0 text-xl font-extrabold text-foreground">Previous sessions</h2>
                        <p className="mb-0 mt-1 text-sm text-muted-foreground">{sessions.length} {sessions.length === 1 ? "session" : "sessions"} in {workspace?.name || "this workspace"}</p>
                    </div>
                    <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 text-muted-foreground transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 sm:w-72">
                        <HiOutlineMagnifyingGlass className="shrink-0 text-lg" /><span className="sr-only">Search sessions</span>
                        <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder="Search sessions..." />
                    </label>
                </div>
                {error && <div role="alert" className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{error}</div>}
                {loading ? <div className="grid h-64 place-content-center"><CircularProgress /></div> : visibleSessions.length ? (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visibleSessions.map((session) => (
                            <Link key={session.id} to={`/dashboard/knowledge/${session.id}${content.hash}`} aria-label={`${content.action}: ${session.title}`} className="group relative min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-5 text-inherit no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_45px_var(--shadow-color)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25">
                                <div className="mb-6 flex items-start justify-between gap-3">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-xl text-primary transition group-hover:bg-primary group-hover:text-primary-foreground"><HiOutlineBookOpen /></div>
                                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${statusStyles[session.status]}`}>{statusLabels[session.status]}</span>
                                </div>
                                <h3 className="m-0 truncate text-lg font-extrabold text-foreground">{session.title}</h3>
                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5"><HiOutlineDocumentText /> {session.ready_source_count} of {session.source_count} sources ready</span>
                                    <span className="inline-flex items-center gap-1.5"><HiOutlineClock /> {formatUpdatedAt(session.updated_at)}</span>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm font-extrabold text-primary"><span>{content.action}</span><HiOutlineArrowRight className="text-lg transition-transform group-hover:translate-x-1" /></div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-surface-muted/40 p-8 text-center"><div><HiOutlineRectangleStack className="mx-auto mb-3 text-4xl text-primary" /><h3 className="m-0 text-base font-extrabold text-foreground">{sessions.length ? "No matching sessions" : "No knowledge sessions yet"}</h3><p className="mb-0 mt-1 text-sm text-muted-foreground">{sessions.length ? "Try another session name." : "Create your first session to upload sources and start chatting."}</p></div></div>
                )}
            </section>

            <Dialog open={open} onClose={() => !creating && setOpen(false)} fullWidth maxWidth="xs">
                <form onSubmit={create}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Create knowledge session</DialogTitle>
                    <DialogContent className="!pt-2"><TextField autoFocus fullWidth required name="title" label="Session title" placeholder="e.g. Product documentation" /></DialogContent>
                    <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpen(false)} disabled={creating}>Cancel</Button><Button type="submit" variant="contained" disabled={creating}>{creating ? "Creating..." : "Create session"}</Button></DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default KnowledgeSessions;
