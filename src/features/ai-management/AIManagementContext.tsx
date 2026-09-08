import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAppSelector } from "@/redux/store";
import { fetchAIAgents, fetchAIAnalytics, fetchAIModels, fetchAIOverview, fetchAIProviders, fetchAIQuotas, fetchAIRequestLogs, fetchAIRouting, fetchAIRuntime, updateAIProvider, type AIOverview, type AIProviderItem, type AIRuntimeSettings, type AIManagementEntity, type AIAnalytics } from "@/services/llms/aiManagement";
import { isAxiosError } from "axios";

type State = {
    workspace?: string;
    workspaceName: string;
    loading: boolean;
    error: string;
    overview: AIOverview | null;
    providers: AIProviderItem[];
    models: AIManagementEntity[];
    agents: AIManagementEntity[];
    routing: AIManagementEntity[];
    quotas: AIManagementEntity[];
    logs: AIManagementEntity[];
    analytics: AIAnalytics;
    runtime: AIRuntimeSettings;
    search: string;
    setSearch: (value: string) => void;
    providerFilter: string;
    setProviderFilter: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    providerCodes: string[];
    filter: <T>(items: T[]) => T[];
    reload: () => Promise<void>;
    toggleProvider: (provider: AIProviderItem) => Promise<void>;
};
const Context = createContext<State | null>(null);

const optionalAnalytics = async <T,>(request: Promise<T>, fallback: T): Promise<T> => {
    try {
        return await request;
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) return fallback;
        throw error;
    }
};

export function AIManagementProvider({ children }: { children: ReactNode }) {
    const active = useAppSelector(state => state.workspace.active);
    const workspaceSlug = active?.slug;
    const requestId = useRef(0);
    const [loading, setLoading] = useState(true);
    const [loadedWorkspace, setLoadedWorkspace] = useState<string | undefined | null>(null);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState<AIOverview | null>(null);
    const [providers, setProviders] = useState<AIProviderItem[]>([]);
    const [models, setModels] = useState<AIManagementEntity[]>([]);
    const [agents, setAgents] = useState<AIManagementEntity[]>([]);
    const [routing, setRouting] = useState<AIManagementEntity[]>([]);
    const [quotas, setQuotas] = useState<AIManagementEntity[]>([]);
    const [logs, setLogs] = useState<AIManagementEntity[]>([]);
    const [analytics, setAnalytics] = useState<AIAnalytics>({ providers: [], daily: [], statuses: [] });
    const [runtime, setRuntime] = useState<AIRuntimeSettings>({ defaultAgentId: null, roles: [] });
    const [search, setSearch] = useState("");
    const [providerFilter, setProviderFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const load = useCallback(() => {
        const currentRequest = ++requestId.current;
        return Promise.all([
                fetchAIOverview(workspaceSlug), fetchAIProviders(), fetchAIModels(),
                fetchAIAgents(workspaceSlug), fetchAIRouting(workspaceSlug), fetchAIQuotas(workspaceSlug),
                optionalAnalytics(fetchAIRequestLogs(workspaceSlug), []),
                optionalAnalytics(fetchAIAnalytics(workspaceSlug), { providers: [], daily: [], statuses: [] }),
                fetchAIRuntime(workspaceSlug),
            ]).then(data => {
            if (currentRequest !== requestId.current) return;
            setOverview(data[0]);
            setProviders(data[1]);
            setModels(data[2]);
            setAgents(data[3]);
            setRouting(data[4]);
            setQuotas(data[5]);
            setLogs(data[6]);
            setAnalytics(data[7]);
            setRuntime(data[8]);
            setError("");
        }).catch(() => {
            if (currentRequest === requestId.current) setError("AI management data could not be loaded. Use Refresh to retry.");
        }).finally(() => {
            if (currentRequest === requestId.current) {
                setLoading(false);
                setLoadedWorkspace(workspaceSlug);
            }
        });
    }, [workspaceSlug]);

    const reload = useCallback(async () => {
        setLoading(true);
        await load();
    }, [load]);

    useEffect(() => {
        void load();
        return () => { requestId.current += 1; };
    }, [load]);

    const providerCodes = useMemo(() => Array.from(new Set([
        ...providers.map(provider => provider.code), ...logs.map(log => log.provider || ""),
    ])).filter(Boolean), [providers, logs]);

    const filter = useCallback(<T,>(items: T[]) => items.filter((value) => {
        const item = value as AIManagementEntity;
        const text = JSON.stringify(item).toLowerCase();
        const provider = String(item.provider || item.providerId?.code || item.code || "").toLowerCase();
        const status = String(item.status || (typeof item.enabled === "boolean" ? (item.enabled ? "enabled" : "disabled") : item.health) || "").toLowerCase();
        return text.includes(search.toLowerCase())
            && (providerFilter === "all" || provider === providerFilter)
            && (statusFilter === "all" || status === statusFilter || item.health === statusFilter);
    }), [search, providerFilter, statusFilter]);

    const toggleProvider = async (provider: AIProviderItem) => {
        const updated = await updateAIProvider(provider.id, { enabled: !provider.enabled });
        setProviders(all => all.map(item => item.id === updated.id ? updated : item));
        setOverview(current => current ? {
            ...current,
            providers: current.providers + (updated.enabled === provider.enabled ? 0 : updated.enabled ? 1 : -1),
        } : current);
    };

    return (
        <Context.Provider value={{
            workspace: workspaceSlug, workspaceName: active?.name || "Global", loading: loading || loadedWorkspace !== workspaceSlug, error,
            overview, providers, models, agents, routing, quotas, logs, analytics, runtime,
            search, setSearch, providerFilter, setProviderFilter, statusFilter, setStatusFilter,
            providerCodes, filter, reload, toggleProvider,
        }}>
            {children}
        </Context.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components -- Preserve the existing colocated context hook API.
export const useAIManagement = () => {
    const value = useContext(Context);
    if (!value) throw new Error("useAIManagement must be used within AIManagementProvider");
    return value;
};
