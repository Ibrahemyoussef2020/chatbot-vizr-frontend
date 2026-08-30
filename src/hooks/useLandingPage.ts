import { useEffect, useState } from "react";
import { getLandingPage, type LandingPageContent } from "@/services/core/landing";

export const useLandingPage = (slug: string) => {
    const [page, setPage] = useState<LandingPageContent | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        getLandingPage(slug, controller.signal)
            .then(setPage)
            .catch((reason) => {
                if (reason?.code !== "ERR_CANCELED") {
                    setError("This page could not be loaded.");
                }
            });

        return () => controller.abort();
    }, [slug]);

    return { page, error, loading: !page && !error };
};
