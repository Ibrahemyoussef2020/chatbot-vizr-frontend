import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { Link, useParams } from "react-router-dom";
import KnowledgeChat from "@/components/knowledge/KnowledgeChat";
import SourceList from "@/components/knowledge/SourceList";
import SourceUploader from "@/components/knowledge/SourceUploader";
import { useAppSelector } from "@/redux/store";
import { askQuestion, getSession, uploadSourcesDirect, type KnowledgeSessionDetail } from "@/services/knowledge/knowledgeBase";

const messageFromError = (error: unknown, fallback: string) => {
    const candidate = error as { response?: { data?: { message?: string } } };
    return candidate.response?.data?.message || fallback;
};

const KnowledgeWorkspace = () => {
    const { sessionId = "" } = useParams();
    const workspace = useAppSelector((state) => state.workspace.active);
    const [detail, setDetail] = useState<KnowledgeSessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadController, setUploadController] = useState<AbortController | null>(null);
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!workspace?.slug || !sessionId) return;
        setLoading(true);
        getSession(workspace.slug, sessionId).then(setDetail).catch((cause) => setError(messageFromError(cause, "Knowledge session could not be loaded."))).finally(() => setLoading(false));
    }, [workspace?.slug, sessionId]);

    useEffect(() => {
        if (!detail || !window.location.hash) return;
        const frame = requestAnimationFrame(() => {
            document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return () => cancelAnimationFrame(frame);
    }, [detail]);

    const upload = async (files: File[]) => {
        if (!workspace?.slug) return;
        const controller = new AbortController();
        setUploadController(controller);
        setUploading(true);
        setUploadProgress(0);
        setError("");
        try {
            setDetail(await uploadSourcesDirect(workspace.slug, sessionId, files, {
                signal: controller.signal,
                onProgress: (progress) => setUploadProgress(progress.percent),
            }));
        } catch (cause) {
            if (!controller.signal.aborted) setError(messageFromError(cause, "Files could not be uploaded."));
        } finally {
            setUploading(false);
            setUploadController(null);
        }
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
        } catch (cause) {
            setError(messageFromError(cause, "The assistant could not answer this question."));
        } finally {
            setAsking(false);
        }
    };

    if (loading) return <div className="grid h-[70vh] place-content-center"><CircularProgress /></div>;
    if (!detail) return <div className="rounded-xl bg-danger/10 p-4 text-danger">{error || "Knowledge session not found."}</div>;

    return (
        <div className="mx-auto grid w-full max-w-[1500px] gap-5 p-2">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <Link to="/dashboard/knowledge" className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-primary no-underline"><HiOutlineArrowLeft /> All sessions</Link>
                    <h1 className="m-0 text-2xl font-extrabold text-foreground">{detail.session.title}</h1>
                    <p className="m-0 text-xs text-muted-foreground">{detail.session.ready_source_count} ready sources · {detail.session.status}</p>
                </div>
            </header>
            {error && <div role="alert" className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">{error}</div>}
            <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
                <aside id="sources" className="grid scroll-mt-6 gap-4">
                    <SourceUploader busy={uploading} progress={uploadProgress} onUpload={upload} onCancel={() => uploadController?.abort()} />
                    <SourceList sources={detail.sources} />
                </aside>
                <div id="chat" className="scroll-mt-6">
                    <KnowledgeChat messages={detail.messages} busy={asking} disabled={!detail.sources.some((source) => source.status === "ready")} onAsk={ask} />
                </div>
            </div>
        </div>
    );
};

export default KnowledgeWorkspace;
