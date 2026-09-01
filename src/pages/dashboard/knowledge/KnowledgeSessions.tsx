import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useEffect, useState, type FormEvent } from "react";
import { HiOutlineBookOpen, HiOutlinePlus } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { createSession, listSessions, type KnowledgeSession } from "@/services/knowledge/knowledgeBase";

interface Props {
    mode?: "sessions" | "upload" | "chat";
}

const pageContent = {
    sessions: { title: "Knowledge Sessions", description: "Create and manage isolated knowledge sessions.", action: "Open workspace", hash: "" },
    upload: { title: "Upload Files", description: "Choose a session where new knowledge sources should be uploaded.", action: "Upload to session", hash: "#sources" },
    chat: { title: "Knowledge Chat", description: "Choose a session and ask questions grounded in its ready sources.", action: "Open knowledge chat", hash: "#chat" },
};

const KnowledgeSessions = ({ mode = "sessions" }: Props) => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<KnowledgeSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!workspace?.slug) return;
        setLoading(true);
        listSessions(workspace.slug).then(setSessions).catch(() => setError("Knowledge sessions could not be loaded.")).finally(() => setLoading(false));
    }, [workspace?.slug]);

    const create = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!workspace?.slug) return;
        setCreating(true);
        setError("");
        try {
            const title = String(new FormData(event.currentTarget).get("title") || "").trim();
            const session = await createSession(workspace.slug, title);
            navigate(`/dashboard/knowledge/${session.id}${pageContent[mode].hash}`);
        } catch {
            setError("The knowledge session could not be created.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 p-2">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
                <div>
                    <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Workspace knowledge</span>
                    <h1 className="mb-1 mt-1 text-3xl font-extrabold text-foreground">{pageContent[mode].title}</h1>
                    <p className="m-0 text-sm text-muted-foreground">{pageContent[mode].description} Workspace: {workspace?.name || "your workspace"}.</p>
                </div>
                <Button variant="contained" startIcon={<HiOutlinePlus />} onClick={() => setOpen(true)}>New session</Button>
            </header>
            {error && <div role="alert" className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{error}</div>}
            {loading ? <div className="grid h-64 place-content-center"><CircularProgress /></div> : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sessions.map((session) => (
                        <Card key={session.id} variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated !p-5">
                            <div className="mb-5 flex items-start justify-between gap-3">
                                <div className="grid h-11 w-11 place-content-center rounded-xl bg-primary/10 text-2xl text-primary"><HiOutlineBookOpen /></div>
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold uppercase text-primary">{session.status}</span>
                            </div>
                            <h2 className="m-0 truncate text-lg font-extrabold text-foreground">{session.title}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">{session.ready_source_count} of {session.source_count} sources ready</p>
                            <Link className="mt-4 inline-block text-sm font-bold text-primary no-underline" to={`/dashboard/knowledge/${session.id}${pageContent[mode].hash}`}>{pageContent[mode].action} →</Link>
                        </Card>
                    ))}
                    {!sessions.length && <div className="col-span-full rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">No knowledge sessions yet.</div>}
                </div>
            )}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <form onSubmit={create}>
                    <DialogTitle>Create knowledge session</DialogTitle>
                    <DialogContent className="!pt-2"><TextField autoFocus fullWidth required name="title" label="Session title" /></DialogContent>
                    <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={creating}>{creating ? "Creating..." : "Create"}</Button></DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default KnowledgeSessions;
