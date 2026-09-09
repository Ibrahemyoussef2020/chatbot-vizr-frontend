import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { HiBookmark, HiOutlineArrowRight, HiOutlineClipboardDocumentList, HiOutlinePencil, HiOutlinePresentationChartLine, HiOutlineTrash } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import type { GeneratedOutput } from "@/services/knowledge/generatedOutputs";
import { deleteOutput, listSavedOutputs, updateOutput } from "@/services/knowledge/knowledgeOutputs";

const messageFromError = (cause: unknown, fallback: string) => (cause as { response?: { data?: { message?: string } } }).response?.data?.message || fallback;

const SavedKnowledgeOutputs = () => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const [outputs, setOutputs] = useState<GeneratedOutput[] | null>(null);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState("");
    useEffect(() => { if (workspace?.slug) listSavedOutputs(workspace.slug).then(setOutputs).catch(() => { setOutputs([]); setError("Saved plans and reports could not be loaded."); }); }, [workspace?.slug]);

    const edit = async (output: GeneratedOutput) => {
        if (!workspace?.slug) return;
        const title = window.prompt(`Edit saved ${output.kind} title`, output.title)?.trim();
        if (!title) return;
        const description = window.prompt(`Edit saved ${output.kind} description`, output.description);
        if (description === null) return;
        setBusyId(output.id); setError("");
        try {
            const updated = await updateOutput(workspace.slug, output.sessionId, output.kind, output.id, { title, description });
            setOutputs((current) => current?.map((item) => item.id === output.id ? updated : item) || []);
        } catch (cause) { setError(messageFromError(cause, `The saved ${output.kind} could not be updated.`)); }
        finally { setBusyId(""); }
    };

    const remove = async (output: GeneratedOutput) => {
        if (!workspace?.slug || !window.confirm(`Delete this saved ${output.kind} and all of its sections?`)) return;
        setBusyId(output.id); setError("");
        try { await deleteOutput(workspace.slug, output.sessionId, output.kind, output.id); setOutputs((current) => current?.filter((item) => item.id !== output.id) || []); }
        catch (cause) { setError(messageFromError(cause, `The saved ${output.kind} could not be deleted.`)); }
        finally { setBusyId(""); }
    };

    if (outputs === null) return <div className="grid h-[65vh] place-content-center"><CircularProgress /></div>;
    return <div className="mx-auto w-full max-w-6xl p-2">
        <header className="mb-6"><span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Knowledge favorites</span><h1 className="mb-1 mt-1 text-2xl font-extrabold text-foreground">Saved plans and reports</h1><p className="m-0 text-sm text-muted-foreground">Your bookmarked knowledge outputs in {workspace?.name || "this workspace"}.</p></header>
        {error && <p className="rounded-xl bg-danger/10 p-4 text-danger">{error}</p>}
        {outputs.length === 0 ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center"><div><HiBookmark className="mx-auto text-4xl text-muted-foreground" /><h2 className="mb-1 mt-3 text-lg font-extrabold">No saved outputs yet</h2><p className="m-0 text-sm text-muted-foreground">Use Save on a plan or report to add it here.</p></div></div> :
            <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">{outputs.map((output) => <article key={output.id} className="self-start rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-primary">
                <div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={`grid h-9 w-9 place-items-center rounded-lg ${output.kind === "plan" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>{output.kind === "plan" ? <HiOutlineClipboardDocumentList /> : <HiOutlinePresentationChartLine />}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${output.kind === "plan" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>{output.kind}</span><span className="rounded-full bg-warning/10 px-2 py-1 text-[10px] font-bold uppercase text-warning">Saved</span></div>
                    <div className="flex gap-1"><button type="button" disabled={busyId === output.id} onClick={() => void edit(output)} aria-label={`Edit saved ${output.kind}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"><HiOutlinePencil /></button><button type="button" disabled={busyId === output.id} onClick={() => void remove(output)} aria-label={`Delete saved ${output.kind}`} className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-transparent text-muted-foreground hover:border-danger hover:text-danger disabled:opacity-50"><HiOutlineTrash /></button></div></div>
                <h2 className="m-0 text-base font-extrabold">{output.title}</h2><p className="mb-3 mt-2 line-clamp-2 text-sm text-muted-foreground">{output.description}</p><Link to={`/dashboard/knowledge/${output.sessionId}/${output.kind}s/${output.id}`} className="inline-flex items-center gap-1 text-xs font-extrabold text-primary no-underline">Open {output.kind}<HiOutlineArrowRight /></Link>
            </article>)}</div>}
    </div>;
};
export default SavedKnowledgeOutputs;
