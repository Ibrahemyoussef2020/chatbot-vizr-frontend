import { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { getSession, type KnowledgeSessionDetail } from "@/services/knowledge/knowledgeBase";

const useKnowledgePageData = (sessionId: string) => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const [detail, setDetail] = useState<KnowledgeSessionDetail | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!workspace?.slug || !sessionId) return;
        getSession(workspace.slug, sessionId)
            .then((nextDetail) => { setDetail(nextDetail); setError(""); })
            .catch(() => setError("Knowledge session could not be loaded."));
    }, [workspace?.slug, sessionId]);

    return { detail, error, loading: detail?.session.id !== sessionId && !error };
};

export default useKnowledgePageData;
