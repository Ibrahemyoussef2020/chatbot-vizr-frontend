import { useEffect, useMemo, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import KnowledgeChat from "@/components/knowledge/KnowledgeChat";
import KnowledgeSessionRail from "@/components/knowledge/KnowledgeSessionRail";
import SourceList from "@/components/knowledge/SourceList";
import SourceUploader from "@/components/knowledge/SourceUploader";
import { useAppSelector } from "@/redux/store";
import { askQuestion, deleteSession, getSession, listSessions, selectSessionModel, updateSession, uploadSourcesDirect, type KnowledgeSession, type KnowledgeSessionDetail } from "@/services/knowledge/knowledgeBase";
import { fetchAIModels, type AIManagementEntity } from "@/services/llms/aiManagement";

const messageFromError = (error: unknown, fallback: string) => {
    const candidate = error as { response?: { data?: { message?: string } } };
    return candidate.response?.data?.message || fallback;
};

const KnowledgeWorkspace = () => {
    const { sessionId = "" } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const workspace = useAppSelector((state) => state.workspace.active);
    const [detail, setDetail] = useState<KnowledgeSessionDetail | null>(null);
    const [sessions, setSessions] = useState<KnowledgeSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadController, setUploadController] = useState<AbortController | null>(null);
    const [asking, setAsking] = useState(false);
    const [selectingModel, setSelectingModel] = useState(false);
    const [availableModels, setAvailableModels] = useState<AIManagementEntity[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!workspace?.slug || !sessionId) return;
        setLoading(true);
        setError("");
        setDetail(null);
        Promise.all([getSession(workspace.slug, sessionId), listSessions(workspace.slug), fetchAIModels()])
            .then(([sessionDetail, sessionList, models]) => { setDetail(sessionDetail); setSessions(sessionList); setAvailableModels(models); })
            .catch((cause) => setError(messageFromError(cause, "Knowledge session could not be loaded.")))
            .finally(() => setLoading(false));
    }, [workspace?.slug, sessionId]);

    const upload = async (files: File[]) => {
        if (!workspace?.slug) return;
        const controller = new AbortController();
        setUploadController(controller);
        setUploading(true);
        setUploadProgress(0);
        setError("");
        try {
            setDetail(await uploadSourcesDirect(workspace.slug, sessionId, files, { signal: controller.signal, onProgress: (progress) => setUploadProgress(progress.percent) }));
        } catch (cause) {
            if (!controller.signal.aborted) setError(messageFromError(cause, "Files could not be uploaded."));
        } finally { setUploading(false); setUploadController(null); }
    };

    const ask = async (question: string) => {
        if (!workspace?.slug || !detail) return;
        const optimistic = { id: `pending-${Date.now()}`, role: "user" as const, content: question, citations: [], created_at: new Date().toISOString() };
        setDetail({ ...detail, messages: [...detail.messages, optimistic] });
        setAsking(true);
        setError("");
        try {
            const answer = await askQuestion(workspace.slug, sessionId, question);
            setDetail((current) => current ? { ...current, messages: [...current.messages, answer] } : current);
        } catch (cause) { setError(messageFromError(cause, "The assistant could not answer this question.")); }
        finally { setAsking(false); }
    };

    const sessionLoading = loading || Boolean(detail && detail.session.id !== sessionId);
    const modelOptions = useMemo(() => availableModels
        .filter((model) => model.enabled !== false && (model.providerId as AIManagementEntity | undefined)?.enabled !== false)
        .map((model) => ({
            id: String(model._id || model.id),
            name: String(model.displayName || model.externalId || model.name || "Model"),
            provider: String((model.providerId as AIManagementEntity | undefined)?.code || "AI"),
        })), [availableModels]);

    const selectModel = async (modelId: string) => {
        if (!workspace?.slug || !detail) return;
        setSelectingModel(true);
        setError("");
        try {
            const session = await selectSessionModel(workspace.slug, sessionId, modelId);
            setDetail((current) => current ? { ...current, session } : current);
            setSessions((current) => current.map((item) => item.id === session.id ? session : item));
        } catch (cause) {
            setError(messageFromError(cause, "The conversation model could not be changed."));
        } finally { setSelectingModel(false); }
    };

    const renameConversation = async () => {
        if (!workspace?.slug || !detail) return;
        const title = window.prompt("Rename Knowledge conversation", detail.session.title)?.trim();
        if (!title || title === detail.session.title) return;
        try {
            const session = await updateSession(workspace.slug, sessionId, title);
            setDetail((current) => current ? { ...current, session } : current);
            setSessions((current) => current.map((item) => item.id === session.id ? session : item));
        } catch (cause) { setError(messageFromError(cause, "The conversation could not be renamed.")); }
    };

    const removeConversation = async () => {
        if (!workspace?.slug || !detail || !window.confirm(`Delete “${detail.session.title}” and all of its messages, files, plans, and reports?`)) return;
        try {
            await deleteSession(workspace.slug, sessionId);
            navigate("/dashboard/knowledge/chat");
        } catch (cause) { setError(messageFromError(cause, "The conversation could not be deleted.")); }
    };

    if (sessionLoading) return (
        <div className="mx-auto h-[calc(100vh-6.5rem)] min-h-[650px] w-full max-w-[1600px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
            <div className="grid h-full min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                <KnowledgeSessionRail sessions={[]} activeSessionId={sessionId} section="chat" loading />
                <main id="chat" className="flex min-h-0 min-w-0 flex-col bg-background" aria-busy="true">
                    <header className="flex min-h-[82px] items-center gap-4 border-b border-border bg-surface px-5 py-4 sm:px-7">
                        <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-primary">Knowledge conversation</span>
                            <div className="mt-1 h-6 w-52 max-w-full animate-pulse rounded-md bg-surface-muted" />
                        </div>
                    </header>
                    <KnowledgeChat sessionTitle="" messages={[]} busy={false} disabled loading onAsk={async () => undefined} />
                </main>
            </div>
        </div>
    );
    if (!detail) return <div className="rounded-xl bg-danger/10 p-4 text-danger">{error || "Knowledge session not found."}</div>;

    const sourcesMode = location.hash === "#sources";

    return (
        <div className="mx-auto h-[calc(100vh-6.5rem)] min-h-[650px] w-full max-w-[1600px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]">
            {sourcesMode ? (
                <div className="theme-scrollbar h-full overflow-y-auto p-5 sm:p-7">
                    <header className="mb-6 border-b border-border pb-5">
                        <Link to={`/dashboard/knowledge/${sessionId}#chat`} className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-primary no-underline"><HiOutlineArrowLeft /> Back to chat</Link>
                        <h1 className="m-0 text-2xl font-extrabold text-foreground">Sources for {detail.session.title}</h1>
                        <p className="mb-0 mt-1 text-xs text-muted-foreground">{detail.session.ready_source_count} ready sources · {detail.session.status}</p>
                    </header>
                    {error && <div role="alert" className="mb-5 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
                    <div id="sources" className="mx-auto grid max-w-5xl items-start gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
                        <SourceUploader busy={uploading} progress={uploadProgress} onUpload={upload} onCancel={() => uploadController?.abort()} />
                        <SourceList sources={detail.sources} />
                    </div>
                </div>
            ) : (
                <div className="grid h-full min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <KnowledgeSessionRail sessions={sessions} activeSessionId={sessionId} section="chat" />
                    <main id="chat" className="flex min-h-0 min-w-0 flex-col bg-background">
                        <header className="flex min-h-[82px] items-center justify-between gap-4 border-b border-border bg-surface px-5 py-4 sm:px-7">
                            <div className="min-w-0"><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-primary">Knowledge conversation</span><h1 className="m-0 truncate text-xl font-extrabold text-foreground">{detail.session.title}</h1><p className="mb-0 mt-0.5 text-xs text-muted-foreground">{detail.session.ready_source_count} ready sources · {detail.session.status}</p></div>
                            <div className="flex shrink-0 items-center gap-2">
                                <Link to={`/dashboard/knowledge/${sessionId}#sources`} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground no-underline transition hover:border-primary hover:text-primary"><HiOutlineDocumentText className="text-base" /><span className="hidden sm:inline">Manage sources</span></Link>
                                <button type="button" onClick={() => void renameConversation()} aria-label="Rename conversation" className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary"><HiOutlinePencil /></button>
                                <button type="button" onClick={() => void removeConversation()} aria-label="Delete conversation" className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-transparent text-muted-foreground hover:border-danger hover:text-danger"><HiOutlineTrash /></button>
                            </div>
                        </header>
                        {error && <div role="alert" className="m-4 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
                        <KnowledgeChat sessionTitle={detail.session.title} messages={detail.messages} busy={asking} disabled={false} onAsk={ask} models={modelOptions} selectedModelId={detail.session.selected_model_id} selectingModel={selectingModel} onSelectModel={selectModel} onManageSources={() => navigate(`/dashboard/knowledge/${sessionId}#sources`)} />
                    </main>
                </div>
            )}
        </div>
    );
};

export default KnowledgeWorkspace;
