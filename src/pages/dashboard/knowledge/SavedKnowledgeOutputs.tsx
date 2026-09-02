import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { HiBookmark, HiOutlineClipboardDocumentList, HiOutlinePresentationChartLine } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import type { GeneratedOutput } from "@/services/knowledge/generatedOutputs";
import { listSavedOutputs } from "@/services/knowledge/knowledgeOutputs";

const SavedKnowledgeOutputs = () => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const [outputs, setOutputs] = useState<GeneratedOutput[] | null>(null);
    const [error, setError] = useState("");
    useEffect(() => { if (workspace?.slug) listSavedOutputs(workspace.slug).then(setOutputs).catch(() => { setOutputs([]); setError("Saved plans and reports could not be loaded."); }); }, [workspace?.slug]);
    if (outputs === null) return <div className="grid h-[65vh] place-content-center"><CircularProgress /></div>;
    return <div className="mx-auto w-full max-w-6xl p-2"><header className="mb-6"><span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Knowledge favorites</span><h1 className="mb-1 mt-1 text-2xl font-extrabold text-foreground">Saved plans and reports</h1><p className="m-0 text-sm text-muted-foreground">Your bookmarked knowledge outputs in {workspace?.name || "this workspace"}.</p></header>{error && <p className="rounded-xl bg-danger/10 p-4 text-danger">{error}</p>}{outputs.length === 0 ? <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center"><div><HiBookmark className="mx-auto text-4xl text-muted-foreground" /><h2 className="mb-1 mt-3 text-lg font-extrabold">No saved outputs yet</h2><p className="m-0 text-sm text-muted-foreground">Use Save on a plan or report to add it here.</p></div></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{outputs.map((output) => <Link key={output.id} to={`/dashboard/knowledge/${output.sessionId}/${output.kind}s/${output.id}`} className="rounded-2xl border border-border bg-surface p-5 text-inherit no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary"><div className="mb-3 flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{output.kind === "plan" ? <HiOutlineClipboardDocumentList /> : <HiOutlinePresentationChartLine />}</span><span className="rounded-full bg-warning/10 px-2 py-1 text-[10px] font-bold uppercase text-warning">Saved</span></div><h2 className="m-0 text-base font-extrabold">{output.title}</h2><p className="mb-0 mt-2 line-clamp-2 text-sm text-muted-foreground">{output.description}</p></Link>)}</div>}</div>;
};
export default SavedKnowledgeOutputs;
