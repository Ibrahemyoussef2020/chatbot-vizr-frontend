import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export interface ThreadFilterParams {
    status: string;
    assigned: string;
    channel: string;
    priority: string;
    topic: string;
    days: number;
    search: string;
    sort: string;
    page: number;
    limit: number;
}

export const useUrlSearchParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters: ThreadFilterParams = useMemo(() => {
        return {
            status: searchParams.get("status") || "all",
            assigned: searchParams.get("assigned") || "all",
            channel: searchParams.get("channel") || "all",
            priority: searchParams.get("priority") || "all",
            topic: searchParams.get("topic") || "all",
            days: Number(searchParams.get("days")) || 30,
            search: searchParams.get("search") || "",
            sort: searchParams.get("sort") || "newest",
            page: Number(searchParams.get("page")) || 1,
            limit: Number(searchParams.get("limit")) || 15,
        };
    }, [searchParams]);

    const setFilter = (key: keyof ThreadFilterParams, value: string | number) => {
        const nextParams = new URLSearchParams(searchParams);

        if (
            value === undefined ||
            value === null ||
            value === "all" ||
            value === "" ||
            (key === "days" && Number(value) === 30) ||
            (key === "page" && Number(value) === 1) ||
            (key === "sort" && String(value) === "newest")
        ) {
            nextParams.delete(key);
        } else {
            nextParams.set(key, String(value));
        }

        setSearchParams(nextParams, { replace: true });
    };

    const setFilters = (newFilters: Partial<ThreadFilterParams>) => {
        const nextParams = new URLSearchParams(searchParams);

        for (const [key, value] of Object.entries(newFilters)) {
            if (
                value === undefined ||
                value === null ||
                value === "all" ||
                value === "" ||
                (key === "days" && Number(value) === 30) ||
                (key === "page" && Number(value) === 1) ||
                (key === "sort" && String(value) === "newest")
            ) {
                nextParams.delete(key);
            } else {
                nextParams.set(key, String(value));
            }
        }

        setSearchParams(nextParams, { replace: true });
    };

    const resetFilters = () => {
        setSearchParams(new URLSearchParams(), { replace: true });
    };

    return {
        searchParams,
        filters,
        setFilter,
        setFilters,
        resetFilters,
    };
};
