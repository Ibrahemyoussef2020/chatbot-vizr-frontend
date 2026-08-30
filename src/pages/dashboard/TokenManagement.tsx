import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import { useEffect, useState, useCallback } from "react";
import {
    HiOutlineArrowPath,
    HiOutlineKey,
    HiOutlineChatBubbleLeftRight,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineCommandLine,
    HiOutlineSquare3Stack3D,
    HiOutlineBolt,
    HiOutlineCpuChip,
    HiOutlineGlobeAlt,
    HiOutlineUserGroup,
    HiOutlineCurrencyDollar,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    fetchTokenAnalytics,
    fetchTokenLogsForApiKey,
    type TokenAnalyticsData,
    type TokenLogRecord,
    type ThreadAgentItem,
} from "@/services/llms/tokens";

const formatCompact = (num?: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return String(num);
};

const formatThreadId = (id: string) => {
    if (id.length <= 16) return id;
    return id.substring(0, 8) + "..." + id.substring(id.length - 4);
};

const sumField = (arr: ThreadAgentItem[], field: "input_tokens" | "output_tokens" | "total_tokens" | "requests") =>
    arr.reduce((acc, a) => acc + (a[field] || 0), 0);

const TokenManagement = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [data, setData] = useState<TokenAnalyticsData | null>(null);

    // Source Filter: 'all' | 'external_api' | 'internal_agent'
    const [sourceFilter, setSourceFilter] = useState<"all" | "external_api" | "internal_agent">("all");

    // Active View Tab: 'apikey' | 'agent' | 'thread'
    const [activeTab, setActiveTab] = useState<"apikey" | "agent" | "thread">("apikey");

    // Collapsible state maps
    const [expandedApiKeys, setExpandedApiKeys] = useState<Record<string, boolean>>({});
    const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
    const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

    // Terminal Telemetry Logs Dialog
    const [logsModalOpen, setLogsModalOpen] = useState<boolean>(false);
    const [selectedApiKeyId, setSelectedApiKeyId] = useState<string | null>(null);
    const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
    const [rawLogs, setRawLogs] = useState<TokenLogRecord[]>([]);
    const [totalLogRecords, setTotalLogRecords] = useState<number>(0);
    const [logsSkip, setLogsSkip] = useState<number>(0);
    const logsLimit = 20;

    const loadAnalyticsData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await fetchTokenAnalytics(activeWorkspace?.slug);
            setData(result);
        } catch {
            setError("Failed to load token analytics from server.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace]);

    useEffect(() => {
        let isMounted = true;

        fetchTokenAnalytics(activeWorkspace?.slug)
            .then((result) => {
                if (isMounted) {
                    setData(result);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load token analytics from server.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    const toggleApiKey = (keyId: string) => {
        setExpandedApiKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
    };

    const toggleAgent = (agentName: string) => {
        setExpandedAgents((prev) => ({ ...prev, [agentName]: !prev[agentName] }));
    };

    const toggleThread = (threadId: string) => {
        setExpandedThreads((prev) => ({ ...prev, [threadId]: !prev[threadId] }));
    };

    const handleOpenLogsModal = async (keyId: string, skip = 0) => {
        setSelectedApiKeyId(keyId);
        setLogsSkip(skip);
        setLogsModalOpen(true);
        setLoadingLogs(true);

        try {
            const res = await fetchTokenLogsForApiKey(keyId, logsLimit, skip);
            setRawLogs(res.logs);
            setTotalLogRecords(res.total_log_records);
        } catch {
            setError("Failed to load raw execution logs.");
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleLogsPageChange = (newSkip: number) => {
        if (!selectedApiKeyId) return;
        void handleOpenLogsModal(selectedApiKeyId, newSkip);
    };

    const getThreadsForApiKey = (keyId: string) => {
        if (!data?.metrics_per_thread) return {};
        const result: Record<string, ThreadAgentItem[]> = {};

        for (const [threadId, agents] of Object.entries(data.metrics_per_thread)) {
            const matching = agents.filter((a) => a.api_key_id === keyId);
            if (matching.length > 0) {
                result[threadId] = matching;
            }
        }
        return result;
    };

    const overall = data?.overall_totals || {
        grand_total_input: 0,
        grand_total_output: 0,
        grand_total_all: 0,
        grand_total_requests: 0,
        total_cost_usd: 0,
    };

    const external = data?.external_vs_internal?.external_api || { input: 0, output: 0, total: 0, requests: 0, costUSD: 0 };
    const internal = data?.external_vs_internal?.internal_agent || { input: 0, output: 0, total: 0, requests: 0, costUSD: 0 };
    const perf = data?.performance_metrics || { avgLatencyMs: 0, avgTokensPerSec: 0, successRate: 100, fallbackRate: 0, costPerThousand: 0 };

    const extPct = overall.grand_total_all ? Math.round((external.total / overall.grand_total_all) * 100) : 50;
    const intPct = 100 - extPct;

    const filteredAgentBreakdown = (data?.agent_breakdown || []).filter((item) => {
        if (sourceFilter === "external_api") return item.sourceType === "external_api";
        if (sourceFilter === "internal_agent") return item.sourceType === "internal_agent";
        return true;
    });

    return (
        <div className="mx-auto grid w-full max-w-[1600px] gap-5 p-1 text-foreground">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Token Analytics Suite</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {activeWorkspace?.name || "Global Scope"}
                        </span>
                    </div>
                    <h1 className="mb-1 mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        Token Telemetry & Model Performance
                    </h1>
                    <p className="m-0 text-xs text-muted-foreground sm:text-sm">
                        Monitor token consumption, Est. USD cost, and latency divided between **External APIs** and **Internal AI Agents**.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* Source Filter Segment Bar */}
                    <div className="flex items-center rounded-xl border border-border bg-card p-1">
                        <button
                            type="button"
                            onClick={() => setSourceFilter("all")}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                sourceFilter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All Traffic
                        </button>
                        <button
                            type="button"
                            onClick={() => setSourceFilter("external_api")}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                sourceFilter === "external_api" ? "bg-sky-500 text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <HiOutlineGlobeAlt className="text-sm" /> External APIs
                        </button>
                        <button
                            type="button"
                            onClick={() => setSourceFilter("internal_agent")}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                sourceFilter === "internal_agent" ? "bg-indigo-600 text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <HiOutlineCpuChip className="text-sm" /> Internal Agents
                        </button>
                    </div>

                    <Button
                        variant="outlined"
                        startIcon={<HiOutlineArrowPath className={loading ? "animate-spin" : ""} />}
                        onClick={loadAnalyticsData}
                        disabled={loading}
                        sx={{
                            borderRadius: "8px",
                            fontWeight: 700,
                            textTransform: "none",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                            height: "34px",
                        }}
                    >
                        {loading ? "Fetching..." : "Refresh"}
                    </Button>
                </div>
            </header>

            {loading && (
                <div className="flex h-64 items-center justify-center">
                    <CircularProgress size={36} />
                </div>
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!loading && data && (
                <div className="space-y-5">
                    {/* Compact Low-Height Rectangular Metric Pills Bar */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Total Tokens</span>
                                <strong className="text-base font-black text-foreground">{formatCompact(overall.grand_total_all)}</strong>
                            </div>
                            <HiOutlineSquare3Stack3D className="text-lg text-primary" />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Est. Cost</span>
                                <strong className="text-base font-black text-emerald-500">${overall.total_cost_usd.toFixed(3)}</strong>
                            </div>
                            <HiOutlineCurrencyDollar className="text-lg text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">External APIs</span>
                                <strong className="text-base font-black text-sky-500">{formatCompact(external.total)}</strong>
                            </div>
                            <HiOutlineGlobeAlt className="text-lg text-sky-500" />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Internal Agents</span>
                                <strong className="text-base font-black text-indigo-500">{formatCompact(internal.total)}</strong>
                            </div>
                            <HiOutlineCpuChip className="text-lg text-indigo-500" />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Avg Latency</span>
                                <strong className="text-base font-black text-amber-500">{perf.avgLatencyMs} ms</strong>
                            </div>
                            <HiOutlineBolt className="text-lg text-amber-500" />
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 shadow-sm">
                            <div>
                                <span className="text-[10px] font-extrabold uppercase text-muted-foreground block">Gen Speed</span>
                                <strong className="text-base font-black text-primary">{perf.avgTokensPerSec} t/s</strong>
                            </div>
                            <HiOutlineUserGroup className="text-lg text-primary" />
                        </div>
                    </div>

                    {/* Rich Telemetry Charts Grid */}
                    <div className="grid gap-5 lg:grid-cols-4">
                        {/* Chart 1: Source Division Donut */}
                        <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated p-4 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Traffic Source Share</h3>
                                <p className="text-[11px] text-muted-foreground">External APIs vs Internal AI Agents</p>
                            </div>

                            <div className="relative my-3 flex h-36 items-center justify-center">
                                <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3.5" />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="none"
                                        stroke="#0ea5e9"
                                        strokeWidth="3.5"
                                        strokeDasharray={`${extPct} ${100 - extPct}`}
                                        strokeDashoffset="0"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="3.5"
                                        strokeDasharray={`${intPct} ${100 - intPct}`}
                                        strokeDashoffset={`-${extPct}`}
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-sm font-black text-foreground">{formatCompact(overall.grand_total_all)}</span>
                                    <span className="block text-[9px] uppercase font-bold text-muted-foreground">Tokens</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border pt-2.5 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                                    <span className="font-semibold text-foreground">APIs ({extPct}%)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                    <span className="font-semibold text-foreground">Agents ({intPct}%)</span>
                                </div>
                            </div>
                        </Card>

                        {/* Chart 2: Model & Cost Distribution */}
                        <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated p-4 lg:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Model Engine & Cost Distribution</h3>
                                    <p className="text-[11px] text-muted-foreground">Token allocation & USD expenditure per model</p>
                                </div>
                                <span className="text-[11px] font-bold text-emerald-500">${overall.total_cost_usd.toFixed(3)} Total</span>
                            </div>

                            <div className="space-y-4 mt-3">
                                {data.model_cost_breakdown.map((item) => {
                                    const sharePct = overall.grand_total_all ? Math.round((item.total_tokens / overall.grand_total_all) * 100) : 33;

                                    return (
                                        <div key={item.model} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{item.model}</span>
                                                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary">
                                                        {item.provider}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-muted-foreground">
                                                    {formatCompact(item.total_tokens)} tokens (${item.costUSD.toFixed(3)})
                                                </span>
                                            </div>
                                            <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-muted mt-2">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${Math.max(sharePct, 5)}%` }}
                                                    title={`Cost: $${item.costUSD}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Chart 3: Performance Speed & Latency */}
                        <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated p-4">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Gateway Performance</h3>
                            <p className="text-[11px] text-muted-foreground mb-3">Latency & throughput efficiency</p>

                            <div className="space-y-3 text-xs">
                                <div className="rounded-xl border border-border p-2.5 bg-card flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold">Generation Speed</span>
                                    <strong className="font-mono text-primary text-sm">{perf.avgTokensPerSec} t/s</strong>
                                </div>

                                <div className="rounded-xl border border-border p-2.5 bg-card flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold">Avg Latency</span>
                                    <strong className="font-mono text-amber-500 text-sm">{perf.avgLatencyMs} ms</strong>
                                </div>

                                <div className="rounded-xl border border-border p-2.5 bg-card flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold">Success Rate</span>
                                    <strong className="font-mono text-emerald-500 text-sm">{perf.successRate}%</strong>
                                </div>

                                <div className="rounded-xl border border-border p-2.5 bg-card flex items-center justify-between">
                                    <span className="text-muted-foreground font-semibold">Cost / 1K Tokens</span>
                                    <strong className="font-mono text-foreground text-sm">${perf.costPerThousand.toFixed(4)}</strong>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* 3 Accordion Tabs */}
                    <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated overflow-hidden">
                        <header className="flex border-b border-border px-6 pt-4 gap-2 bg-surface-muted/50">
                            <button
                                type="button"
                                onClick={() => setActiveTab("apikey")}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                                    activeTab === "apikey"
                                        ? "border-primary text-primary bg-card shadow-sm"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <HiOutlineKey className="text-base" />
                                By API Key ({Object.keys(data.metrics_per_api_key).length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("agent")}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                                    activeTab === "agent"
                                        ? "border-primary text-primary bg-card shadow-sm"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <HiOutlineCpuChip className="text-base" />
                                By Agent Function ({filteredAgentBreakdown.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("thread")}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                                    activeTab === "thread"
                                        ? "border-primary text-primary bg-card shadow-sm"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <HiOutlineChatBubbleLeftRight className="text-base" />
                                By Thread ({Object.keys(data.metrics_per_thread).length})
                            </button>
                        </header>

                        {/* Tab Content: By API Key */}
                        {activeTab === "apikey" && (
                            <div className="p-5 space-y-3">
                                {Object.entries(data.metrics_per_api_key).map(([keyId, keyData]) => {
                                    const isExpanded = !!expandedApiKeys[keyId];
                                    const threadsMap = getThreadsForApiKey(keyId);

                                    return (
                                        <div key={keyId} className="rounded-xl border border-border bg-card overflow-hidden">
                                            <div
                                                onClick={() => toggleApiKey(keyId)}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-muted/30 cursor-pointer select-none"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? <HiOutlineChevronUp className="text-muted-foreground" /> : <HiOutlineChevronDown className="text-muted-foreground" />}
                                                    <HiOutlineKey className="text-lg text-primary" />
                                                    <div>
                                                        <span className="font-mono text-xs font-bold text-foreground">{keyId}</span>
                                                        <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-primary">
                                                            {keyData.provider}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-sky-500 font-semibold">{formatCompact(keyData.totals.input_tokens)} In</span>
                                                    <span className="text-emerald-500 font-semibold">{formatCompact(keyData.totals.output_tokens)} Out</span>
                                                    <span className="font-bold text-foreground">{formatCompact(keyData.totals.total_tokens)} Total</span>
                                                    <span className="text-amber-500 font-semibold">{keyData.totals.requests} Reqs</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-border p-3 bg-card text-foreground">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[11px] font-bold uppercase text-muted-foreground">
                                                            Threads executed with key ({Object.keys(threadsMap).length})
                                                        </span>
                                                        <Button
                                                            size="small"
                                                            startIcon={<HiOutlineCommandLine />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                void handleOpenLogsModal(keyId);
                                                            }}
                                                            sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 700 }}
                                                        >
                                                            Terminal Telemetry Logs
                                                        </Button>
                                                    </div>

                                                    <div className="overflow-x-auto rounded-lg border border-border">
                                                        <table className="w-full text-xs text-left border-collapse">
                                                            <thead className="bg-surface-muted text-muted-foreground uppercase font-bold">
                                                                <tr>
                                                                    <th className="px-3 py-2">Thread ID</th>
                                                                    <th className="px-3 py-2 text-right">Input</th>
                                                                    <th className="px-3 py-2 text-right">Output</th>
                                                                    <th className="px-3 py-2 text-right">Total</th>
                                                                    <th className="px-3 py-2 text-center">Reqs</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border bg-card">
                                                                {Object.entries(threadsMap).map(([tId, agents]) => (
                                                                    <tr key={tId} className="hover:bg-surface-muted/30">
                                                                        <td className="px-3 py-2 font-mono font-bold text-foreground">{formatThreadId(tId)}</td>
                                                                        <td className="px-3 py-2 text-right text-sky-500 font-semibold">{formatCompact(agents[0].input_tokens)}</td>
                                                                        <td className="px-3 py-2 text-right text-emerald-500 font-semibold">{formatCompact(agents[0].output_tokens)}</td>
                                                                        <td className="px-3 py-2 text-right font-bold text-foreground">{formatCompact(agents[0].total_tokens)}</td>
                                                                        <td className="px-3 py-2 text-center text-amber-500 font-semibold">{agents[0].requests}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tab Content: By Agent Function */}
                        {activeTab === "agent" && (
                            <div className="p-5 space-y-3">
                                {filteredAgentBreakdown.map((agent) => {
                                    const isExpanded = !!expandedAgents[agent.agentName];
                                    const isInternal = agent.sourceType === "internal_agent";

                                    return (
                                        <div key={agent.agentName} className="rounded-xl border border-border bg-card overflow-hidden">
                                            <div
                                                onClick={() => toggleAgent(agent.agentName)}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-muted/20 cursor-pointer select-none"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? <HiOutlineChevronUp className="text-muted-foreground" /> : <HiOutlineChevronDown className="text-muted-foreground" />}
                                                    {isInternal ? <HiOutlineCpuChip className="text-lg text-indigo-500" /> : <HiOutlineGlobeAlt className="text-lg text-sky-500" />}
                                                    <div>
                                                        <span className="font-bold text-xs text-foreground">{agent.agentName}</span>
                                                        <span
                                                            className={`ml-2 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                                                isInternal ? "bg-indigo-500/10 text-indigo-600" : "bg-sky-500/10 text-sky-600"
                                                            }`}
                                                        >
                                                            {isInternal ? "Internal Agent" : "External API"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-sky-500 font-semibold">{formatCompact(agent.input_tokens)} Prompt</span>
                                                    <span className="text-emerald-500 font-semibold">{formatCompact(agent.output_tokens)} Comp</span>
                                                    <span className="font-bold text-foreground">{formatCompact(agent.total_tokens)} Total</span>
                                                    <span className="text-emerald-600 font-bold">${agent.costUSD.toFixed(3)}</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-border p-3 bg-card text-foreground text-xs space-y-2">
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Execution Requests: <strong className="text-foreground">{agent.requests}</strong></span>
                                                        <span>Est. Cost Share: <strong className="text-foreground">${agent.costUSD.toFixed(4)}</strong></span>
                                                    </div>
                                                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted mt-2">
                                                        <div
                                                            className="h-full bg-sky-500"
                                                            style={{ width: `${agent.total_tokens ? Math.round((agent.input_tokens / agent.total_tokens) * 100) : 50}%` }}
                                                        />
                                                        <div
                                                            className="h-full bg-emerald-500"
                                                            style={{ width: `${agent.total_tokens ? Math.round((agent.output_tokens / agent.total_tokens) * 100) : 50}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Tab Content: By Thread */}
                        {activeTab === "thread" && (
                            <div className="p-5 space-y-3">
                                {Object.entries(data.metrics_per_thread).map(([threadId, agents]) => {
                                    const isExpanded = !!expandedThreads[threadId];
                                    const totalIn = sumField(agents, "input_tokens");
                                    const totalOut = sumField(agents, "output_tokens");
                                    const totalAll = sumField(agents, "total_tokens");
                                    const totalReqs = sumField(agents, "requests");

                                    return (
                                        <div key={threadId} className="rounded-xl border border-border bg-card overflow-hidden">
                                            <div
                                                onClick={() => toggleThread(threadId)}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-muted/20 cursor-pointer select-none"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    {isExpanded ? <HiOutlineChevronUp className="text-muted-foreground" /> : <HiOutlineChevronDown className="text-muted-foreground" />}
                                                    <HiOutlineChatBubbleLeftRight className="text-lg text-primary" />
                                                    <span className="font-mono text-xs font-bold text-foreground">{threadId}</span>
                                                </div>

                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-sky-500 font-semibold">{formatCompact(totalIn)} In</span>
                                                    <span className="text-emerald-500 font-semibold">{formatCompact(totalOut)} Out</span>
                                                    <span className="font-bold text-foreground">{formatCompact(totalAll)} Total</span>
                                                    <span className="text-amber-500 font-semibold">{totalReqs} Reqs</span>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-border p-3 bg-card text-foreground space-y-2">
                                                    {agents.map((agent) => (
                                                        <div key={agent.api_key_id} className="rounded border border-border p-2 bg-surface-muted/30 text-xs flex items-center justify-between">
                                                            <span className="font-mono font-bold text-foreground">{agent.api_key_id} ({agent.provider})</span>
                                                            <span className="font-semibold text-muted-foreground">{formatCompact(agent.total_tokens)} tokens</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Terminal Telemetry Logs Dialog */}
            <Dialog open={logsModalOpen} onClose={() => setLogsModalOpen(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                    Raw Telemetry Logs — <span className="font-mono text-primary">{selectedApiKeyId}</span>
                </DialogTitle>

                <DialogContent dividers>
                    {loadingLogs && (
                        <div className="flex h-48 items-center justify-center">
                            <CircularProgress size={32} />
                        </div>
                    )}

                    {!loadingLogs && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Showing records {logsSkip + 1} - {Math.min(logsSkip + logsLimit, totalLogRecords)} of {totalLogRecords}</span>
                                <span>Limit: {logsLimit} per page</span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-border">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-surface-muted uppercase font-bold text-muted-foreground">
                                        <tr>
                                            <th className="p-2.5">Run ID</th>
                                            <th className="p-2.5">Thread ID</th>
                                            <th className="p-2.5">Source / Agent</th>
                                            <th className="p-2.5">Model</th>
                                            <th className="p-2.5 text-right">Prompt</th>
                                            <th className="p-2.5 text-right">Comp</th>
                                            <th className="p-2.5 text-right">Total</th>
                                            <th className="p-2.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-card text-foreground">
                                        {rawLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-surface-muted/30">
                                                <td className="p-2.5 font-mono text-primary font-semibold">{log.id}</td>
                                                <td className="p-2.5 font-mono text-foreground">{formatThreadId(log.threadId)}</td>
                                                <td className="p-2.5 font-semibold text-foreground">{log.agentName || log.sourceType}</td>
                                                <td className="p-2.5 font-semibold text-muted-foreground">{log.model}</td>
                                                <td className="p-2.5 text-right text-sky-500">{log.promptTokens}</td>
                                                <td className="p-2.5 text-right text-emerald-500">{log.completionTokens}</td>
                                                <td className="p-2.5 text-right font-bold text-foreground">{log.totalTokens}</td>
                                                <td className="p-2.5 text-center">
                                                    <span
                                                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                                            log.status === "success"
                                                                ? "bg-success/10 text-success"
                                                                : "bg-warning/10 text-warning"
                                                        }`}
                                                    >
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </DialogContent>

                <DialogActions sx={{ justify: "space-between", p: 2 }}>
                    <div className="flex gap-2">
                        <Button
                            disabled={logsSkip === 0 || loadingLogs}
                            onClick={() => handleLogsPageChange(Math.max(0, logsSkip - logsLimit))}
                            size="small"
                        >
                            Previous Page
                        </Button>
                        <Button
                            disabled={logsSkip + logsLimit >= totalLogRecords || loadingLogs}
                            onClick={() => handleLogsPageChange(logsSkip + logsLimit)}
                            size="small"
                        >
                            Next Page
                        </Button>
                    </div>

                    <Button onClick={() => setLogsModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TokenManagement;