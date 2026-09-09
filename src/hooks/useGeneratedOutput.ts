import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/store";
import { deleteOutput, deleteOutputSchema, editOutputSchema, getOutput, regenerateOutput, retryOutputSchema, setOutputSaved, shareOutput, unshareOutput, updateOutput, type EditMode, type OutputKind } from "@/services/knowledge/knowledgeOutputs";
import type { GeneratedOutput, GeneratedSectionInput } from "@/services/knowledge/generatedOutputs";
import useKnowledgePageData from "./useKnowledgePageData";

export type GeneratedOutputKind = OutputKind;
interface OutputState { key: string; data: GeneratedOutput | null; error: string; notFound: boolean; }

const errorMessage = (error: unknown) => (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Generated output could not be loaded.";

const useGeneratedOutput = (sessionId: string, kind: GeneratedOutputKind, outputId: string) => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const navigate = useNavigate();
    const sessionState = useKnowledgePageData(sessionId);
    const requestKey = `${sessionId}:${kind}:${outputId}`;
    const [state, setState] = useState<OutputState>({ key: "", data: null, error: "", notFound: false });
    const [mutatingSchemaId, setMutatingSchemaId] = useState("");
    const [reloadVersion, setReloadVersion] = useState(0);
    const [outputAction, setOutputAction] = useState("");

    useEffect(() => {
        if (!workspace?.slug || !sessionId || !outputId) return;
        getOutput(workspace.slug, sessionId, kind, outputId)
            .then((data) => setState({ key: requestKey, data, error: "", notFound: false }))
            .catch((error: unknown) => {
                const status = Number((error as { response?: { status?: number } }).response?.status);
                setState({ key: requestKey, data: null, error: errorMessage(error), notFound: status === 404 });
            });
    }, [kind, outputId, reloadVersion, requestKey, sessionId, workspace]);

    const replaceSchema = (schemaId: string, next: GeneratedOutput["sections"][number]) => setState((current) => current.data ? { ...current, data: { ...current.data, sections: current.data.sections.map((section) => section.schemaId === schemaId ? next : section) } } : current);

    const retrySchema = async (schemaId: string, instruction?: string) => {
        if (!workspace?.slug) return;
        setMutatingSchemaId(schemaId);
        try { replaceSchema(schemaId, await retryOutputSchema(workspace.slug, sessionId, kind, outputId, schemaId, instruction)); setReloadVersion((version) => version + 1); }
        finally { setMutatingSchemaId(""); }
    };

    const editSchema = async (schemaId: string, mode: EditMode, payload: GeneratedSectionInput | { instruction: string }) => {
        if (!workspace?.slug) return;
        setMutatingSchemaId(schemaId);
        try { replaceSchema(schemaId, await editOutputSchema(workspace.slug, sessionId, kind, outputId, schemaId, mode, payload)); setReloadVersion((version) => version + 1); }
        finally { setMutatingSchemaId(""); }
    };

    const removeSchema = async (schemaId: string) => {
        if (!workspace?.slug) return;
        setMutatingSchemaId(schemaId);
        try {
            await deleteOutputSchema(workspace.slug, sessionId, kind, outputId, schemaId);
            setState((current) => current.data ? { ...current, data: { ...current.data, schemaCount: Math.max(0, current.data.schemaCount - 1), sections: current.data.sections.filter((section) => section.schemaId !== schemaId) } } : current);
            setReloadVersion((version) => version + 1);
        } finally { setMutatingSchemaId(""); }
    };

    const toggleSaved = async () => {
        if (!workspace?.slug || !state.data) return;
        setOutputAction("save");
        try {
            const saved = !state.data.isSaved;
            const data = await setOutputSaved(workspace.slug, sessionId, kind, outputId, saved);
            setState((current) => ({ ...current, data }));
            toast.success(saved ? `${kind === "plan" ? "Plan" : "Report"} saved` : "Removed from saved items");
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setOutputAction(""); }
    };

    const regenerateAll = async () => {
        if (!workspace?.slug || !state.data) return;
        setOutputAction("regenerate");
        try {
            const data = await regenerateOutput(workspace.slug, sessionId, kind, outputId);
            setState((current) => ({ ...current, data }));
            toast.success(`${kind === "plan" ? "Plan" : "Report"} regenerated`);
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setOutputAction(""); }
    };

    const share = async () => {
        if (!workspace?.slug) return;
        setOutputAction("share");
        try {
            const token = await shareOutput(workspace.slug, sessionId, kind, outputId);
            const url = `${window.location.origin}/shared/knowledge/${token}`;
            await navigator.clipboard.writeText(url);
            setState((current) => current.data ? { ...current, data: { ...current.data, isShared: true } } : current);
            toast.success("Read-only share link copied");
            return url;
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setOutputAction(""); }
    };

    const unshare = async () => {
        if (!workspace?.slug) return;
        setOutputAction("share");
        try {
            await unshareOutput(workspace.slug, sessionId, kind, outputId);
            setState((current) => current.data ? { ...current, data: { ...current.data, isShared: false } } : current);
            toast.success("Sharing disabled");
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setOutputAction(""); }
    };

    const editOutput = async () => {
        if (!workspace?.slug || !state.data) return;
        const title = window.prompt(`Edit ${kind} title`, state.data.title)?.trim();
        if (!title) return;
        const description = window.prompt(`Edit ${kind} description`, state.data.description);
        if (description === null) return;
        setOutputAction("edit");
        try {
            const data = await updateOutput(workspace.slug, sessionId, kind, outputId, { title, description });
            setState((current) => ({ ...current, data }));
            toast.success(`${kind === "plan" ? "Plan" : "Report"} updated`);
        } catch (error) { toast.error(errorMessage(error)); }
        finally { setOutputAction(""); }
    };

    const removeOutput = async () => {
        if (!workspace?.slug || !state.data || !window.confirm(`Delete this ${kind} and all of its sections?`)) return;
        setOutputAction("delete");
        try {
            await deleteOutput(workspace.slug, sessionId, kind, outputId);
            toast.success(`${kind === "plan" ? "Plan" : "Report"} deleted`);
            navigate(`/dashboard/knowledge/${sessionId}/${kind}s`);
        } catch (error) { toast.error(errorMessage(error)); setOutputAction(""); }
    };

    return { ...sessionState, output: state.data, outputError: state.error, outputNotFound: state.notFound, outputLoading: state.key !== requestKey, mutatingSchemaId, outputAction, reload: () => setReloadVersion((version) => version + 1), retrySchema, editSchema, removeSchema, toggleSaved, regenerateAll, share, unshare, editOutput, removeOutput };
};

export default useGeneratedOutput;
