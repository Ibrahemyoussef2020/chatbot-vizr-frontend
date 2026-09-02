import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useGeneratedOutput, { type GeneratedOutputKind } from "@/hooks/useGeneratedOutput";
import { useAppSelector } from "@/redux/store";
import type { GeneratedOutput } from "@/services/knowledge/generatedOutputs";
import { generateOutput, listOutputs } from "@/services/knowledge/knowledgeOutputs";
import GeneratedOutputPage from "./GeneratedOutputPage";

const KnowledgeOutputRoute = ({ kind }: { kind: GeneratedOutputKind }) => {
    const { sessionId = "", outputId = "" } = useParams();
    const workspace = useAppSelector((state) => state.workspace.active);
    const navigate = useNavigate();
    const [outputs, setOutputs] = useState<GeneratedOutput[] | null>(null);
    const [listError, setListError] = useState("");
    const [generating, setGenerating] = useState(false);
    const { detail, output, error, loading, outputError, outputNotFound, outputLoading, mutatingSchemaId, outputAction, retrySchema, editSchema, removeSchema, toggleSaved, regenerateAll, share, unshare } = useGeneratedOutput(sessionId, kind, outputId);

    useEffect(() => {
        if (outputId || !workspace?.slug || !sessionId) return;
        listOutputs(workspace.slug, sessionId, kind).then(setOutputs).catch((requestError: unknown) => {
            setListError((requestError as { response?: { data?: { message?: string } } }).response?.data?.message || `Unable to load ${kind}s.`);
            setOutputs([]);
        });
    }, [kind, outputId, sessionId, workspace?.slug]);

    const generate = async () => {
        if (!workspace?.slug || !sessionId || generating) return;
        setGenerating(true);
        setListError("");
        try {
            const created = await generateOutput(workspace.slug, sessionId, kind);
            navigate(`/dashboard/knowledge/${sessionId}/${kind}s/${created.id}`);
        } catch (requestError: unknown) {
            setListError((requestError as { response?: { data?: { message?: string } } }).response?.data?.message || `Unable to generate the ${kind}.`);
        } finally {
            setGenerating(false);
        }
    };

    if (!outputId) {
        if (outputs === null) return <div className="grid h-[70vh] place-content-center"><CircularProgress /></div>;
        return (
            <div className="mx-auto w-full max-w-5xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <div><h1 className="m-0 text-2xl font-extrabold text-foreground">Session {kind}s</h1><p className="mt-2 text-sm text-muted-foreground">All {kind}s created in this knowledge session.</p></div>
                    <button type="button" disabled={generating} onClick={() => void generate()} className="shrink-0 rounded-xl border-0 bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">{generating ? `Generating ${kind}...` : `Generate ${kind}`}</button>
                </div>
                {listError && <p className="rounded-xl bg-danger/10 p-4 text-danger">{listError}</p>}
                {outputs.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center"><h2 className="m-0 text-lg font-extrabold">No {kind}s in this session</h2><p className="mb-0 mt-2 text-sm text-muted-foreground">Generate a {kind} from this session's ready knowledge sources.</p></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{outputs.map((item) => <Link key={item.id} to={`/dashboard/knowledge/${sessionId}/${kind}s/${item.id}`} className="rounded-2xl border border-border bg-surface p-5 text-inherit no-underline shadow-sm transition hover:-translate-y-1 hover:border-primary"><h2 className="m-0 text-base font-extrabold">{item.title}</h2><p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p><div className="mt-4 text-xs font-bold text-primary">{item.schemaCount} sections · {item.status}</div></Link>)}</div>}
            </div>
        );
    }

    if (loading || outputLoading) return <div className="grid h-[70vh] place-content-center"><CircularProgress /></div>;
    if (!detail) return <div className="rounded-xl bg-danger/10 p-4 text-danger">{error || "Knowledge session not found."}</div>;
    if (!output) return <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center"><div><h1 className="m-0 text-2xl font-extrabold text-foreground">{outputNotFound ? `No ${kind} exists yet` : `Unable to load ${kind}`}</h1><p className="mb-0 mt-2 text-sm text-muted-foreground">{outputError || `A generated ${kind} for ${detail.session.title} will appear here after it is created.`}</p></div></div>;

    return <GeneratedOutputPage output={output} sessionTitle={detail.session.title} kind={kind} mutatingSchemaId={mutatingSchemaId} outputAction={outputAction} onRetrySchema={retrySchema} onEditSchema={editSchema} onRemoveSchema={removeSchema} onToggleSaved={toggleSaved} onRegenerate={regenerateAll} onShare={share} onUnshare={unshare} />;
};

export default KnowledgeOutputRoute;
