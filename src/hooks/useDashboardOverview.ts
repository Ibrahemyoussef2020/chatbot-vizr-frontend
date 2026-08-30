import { useState, useEffect, useCallback } from "react";
import { getDashboardOverview, type DashboardOverview } from "@/services/dashboard/dashboard";
import { assignThreadToAgent, updateThreadStatus } from "@/services/dashboard/analytics";
import { useUrlSearchParams } from "@/hooks/useUrlSearchParams";

export const agentOptions = [
    { id: "unassigned", name: "Unassigned", email: "" },
    { id: "agent-101", name: "Sarah Support Agent", email: "sarah.agent@vizr.local" },
    { id: "agent-102", name: "Karim Tech Lead", email: "karim.lead@vizr.local" },
    { id: "agent-103", name: "Amr Customer Success", email: "amr.cs@vizr.local" },
];

export const useDashboardOverview = (workspaceSlug?: string) => {
    const { searchParams } = useUrlSearchParams();
    const [overview, setOverview] = useState<DashboardOverview | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadData = useCallback(() => {
        setIsLoading(true);
        const controller = new AbortController();
        getDashboardOverview(workspaceSlug, controller.signal)
            .then((data) => {
                setOverview(data);
                setError("");
            })
            .catch((requestError) => {
                if (requestError?.code !== "ERR_CANCELED") {
                    setError("Dashboard data could not be loaded.");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
        return () => controller.abort();
    }, [workspaceSlug]);

    useEffect(() => {
        const cleanup = loadData();
        return cleanup;
    }, [loadData, searchParams]);

    const handleAssign = async (threadId: string, agentId: string) => {
        const selectedAgent = agentOptions.find((a) => a.id === agentId);
        if (!selectedAgent) return;

        try {
            await assignThreadToAgent(
                threadId,
                selectedAgent.id,
                selectedAgent.name,
                selectedAgent.email,
            );
            loadData();
        } catch {
            setError("Failed to assign thread agent");
        }
    };

    const handleStatusToggle = async (threadId: string, currentStatus: string) => {
        const nextStatus = currentStatus === "open" ? "ended" : "active";
        try {
            await updateThreadStatus(threadId, nextStatus);
            loadData();
        } catch {
            setError("Failed to update thread status");
        }
    };

    return {
        overview,
        error,
        isLoading,
        loadData,
        handleAssign,
        handleStatusToggle,
    };
};
