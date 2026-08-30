import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import {
    HiOutlineChatBubbleLeftRight,
    HiOutlineClock,
    HiOutlineSparkles,
    HiOutlineStar,
    HiOutlineUsers,
    HiOutlineArrowTrendingUp,
    HiOutlinePaperAirplane,
    HiOutlineUserPlus,
} from "react-icons/hi2";
import { type ThreadItem } from "@/services/dashboard/analytics";
import { useAppSelector } from "@/redux/store";
import {
    ChannelDistributionChart,
    DonutChart,
    HourlyActivityChart,
    TimeSeriesAreaChart,
    TopicHorizontalBarChart,
} from "@/components/dashboard/AnalyticsCharts";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { ReplyThreadModal } from "@/components/dashboard/ReplyThreadModal";
import { useDashboardOverview, agentOptions } from "@/hooks/useDashboardOverview";

const formatDate = (value?: string) => {
    if (!value) return "N/A";
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
};

const Overview = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const [selectedReplyThread, setSelectedReplyThread] = useState<ThreadItem | null>(null);

    const {
        overview,
        error,
        isLoading,
        loadData,
        handleAssign,
        handleStatusToggle
    } = useDashboardOverview(activeWorkspace?.slug);

    if (!overview && !error) {
        return (
            <div className="grid min-h-80 place-items-center">
                <CircularProgress aria-label="Loading dashboard" />
            </div>
        );
    }

    const resolutionSplit = [
        { label: "AI Automated", value: overview?.stats.aiResolutionPercent || 88, color: "var(--primary)" },
        { label: "Escalated to Agent", value: overview?.stats.humanHandoffPercent || 12, color: "var(--warning)" },
        { label: "Pending Customer", value: 5, color: "var(--secondary)" },
    ];

    return (
        <div className="mx-auto grid w-full max-w-[1600px] gap-5 p-1">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Overview</span>
                        <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                            URL Synced Live
                        </span>
                    </div>
                    <h1 className="mb-1 mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        {activeWorkspace?.name || "Workspace"} Command Center
                    </h1>
                    <p className="m-0 text-xs text-muted-foreground sm:text-sm">
                        High-density AI Chatbot operational metrics, real-time workload, and visitor analytics.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3.5 py-1.5 text-xs font-bold text-success shadow-sm">
                    <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" /> Live Workspace Telemetry
                </div>
            </header>

            <DashboardFilterBar />

            {error && <Alert severity="error">{error}</Alert>}

            {overview && (
                <div className="grid gap-5">
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="KPI Telemetry Strip">
                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Total Conversations
                                    </span>
                                    <HiOutlineChatBubbleLeftRight className="text-lg text-primary" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-foreground">
                                    {overview.stats.total.toLocaleString()}
                                </strong>
                                <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-success">
                                    <HiOutlineArrowTrendingUp /> +18.4% this week
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Active Queue
                                    </span>
                                    <HiOutlineClock className="text-lg text-warning" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-warning">
                                    {overview.stats.open}
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                                    Live in inbox
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        AI Resolution Rate
                                    </span>
                                    <HiOutlineSparkles className="text-lg text-primary" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-primary">
                                    {overview.stats.aiResolutionPercent}%
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-primary">
                                    Zero human handoff
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        CSAT Rating
                                    </span>
                                    <HiOutlineStar className="text-lg text-warning" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-foreground">
                                    {overview.stats.csatScore} / 5.0
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                                    {overview.stats.avgResponseSec}s avg response
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Leads Captured
                                    </span>
                                    <HiOutlineUsers className="text-lg text-success" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-success">
                                    {overview.stats.leadsCaptured} Leads
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-success">
                                    {overview.stats.ragAccuracyPercent}% RAG accuracy
                                </span>
                            </CardContent>
                        </Card>
                    </section>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-8">
                            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                                <div>
                                    <h2 className="text-base font-extrabold text-foreground">Conversation Growth & Resolution Curve</h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Live time-series volume trends over recent days
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5 text-primary">
                                        <span className="h-2 w-2 rounded-full bg-primary" /> Total Volume
                                    </span>
                                    <span className="flex items-center gap-1.5 text-secondary">
                                        <span className="h-2 w-2 rounded-full bg-secondary" /> Resolved
                                    </span>
                                </div>
                            </div>

                            <TimeSeriesAreaChart data={overview.time_series} />
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4 flex flex-col justify-between">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Resolution Split</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">AI Automation vs Escalations</p>
                            </div>

                            <DonutChart
                                data={resolutionSplit}
                                centerValue={`${overview.stats.aiResolutionPercent}%`}
                                centerLabel="AI Resolution"
                            />

                            <div className="mt-4 rounded-lg bg-surface-muted p-3 text-center text-xs">
                                <span className="text-muted-foreground">Average Response Speed:</span>{" "}
                                <strong className="text-foreground font-bold">{overview.stats.avgResponseSec}s SLA</strong>
                            </div>
                        </Card>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Omnichannel Breakdown</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Message volume per active channel</p>
                            </div>

                            <ChannelDistributionChart data={overview.channels} />
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Customer Query Topics</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Categorized intent distribution</p>
                            </div>

                            <TopicHorizontalBarChart data={overview.topics} />
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">24-Hour Peak Load Heatmap</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Hourly visitor activity distribution</p>
                            </div>

                            <HourlyActivityChart data={overview.hourly_activity} />
                        </Card>
                    </div>

                    <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated overflow-hidden">
                        <header className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-muted">
                            <div className="flex items-center gap-2">
                                <HiOutlineChatBubbleLeftRight className="text-primary text-base" />
                                <h2 className="m-0 text-sm font-extrabold text-foreground">Recent Active Conversations</h2>
                            </div>
                            <span className="text-xs text-muted-foreground font-semibold">
                                {overview.stats.recent} threads this week
                            </span>
                        </header>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                                <thead className="bg-surface-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-2.5">Visitor</th>
                                        <th className="px-4 py-2.5">Workspace Slug</th>
                                        <th className="px-4 py-2.5">Status</th>
                                        <th className="px-4 py-2.5">Priority</th>
                                        <th className="px-4 py-2.5">Created At</th>
                                        <th className="px-4 py-2.5">Last Activity</th>
                                        <th className="px-4 py-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium">
                                    {(overview.recent_threads as ThreadItem[]).map((thread) => {
                                        const currentAgentId = thread.assigned_agent?.id || "unassigned";
                                        const priority = thread.priority || "medium";

                                        return (
                                            <tr key={thread.id} className="hover:bg-surface-muted/40 transition-colors">
                                                <td className="px-4 py-2">
                                                    <strong className="block text-foreground font-semibold leading-tight">{thread.user_name}</strong>
                                                    <span className="text-[11px] text-muted-foreground block leading-tight">{thread.user_email || "No email"}</span>
                                                    {thread.user_phone && (
                                                        <span className="text-[10px] text-primary/80 block leading-tight">{thread.user_phone}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-muted-foreground font-medium">{thread.system_slug}</td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer ${
                                                            thread.status === "open"
                                                                ? "bg-warning/15 text-warning"
                                                                : "bg-success/15 text-success"
                                                        }`}
                                                        onClick={() => handleStatusToggle(thread.id, thread.status)}
                                                    >
                                                        {thread.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                            priority === "high"
                                                                ? "bg-danger/15 text-danger"
                                                                : priority === "medium"
                                                                ? "bg-warning/15 text-warning"
                                                                : "bg-info/15 text-info"
                                                        }`}
                                                    >
                                                        {priority.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-muted-foreground text-[11px]">{formatDate(thread.created_at)}</td>
                                                <td className="px-4 py-2 text-muted-foreground text-[11px]">{formatDate(thread.updated_at)}</td>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Select
                                                            value={currentAgentId}
                                                            onChange={(e) => handleAssign(thread.id, e.target.value)}
                                                            size="small"
                                                            sx={{
                                                                height: "32px",
                                                                fontSize: "0.75rem",
                                                                color: "var(--foreground)",
                                                                borderRadius: "8px",
                                                                bgcolor: "var(--card)",
                                                                "& .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: "var(--border)",
                                                                },
                                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                    borderColor: "var(--primary)",
                                                                },
                                                            }}
                                                        >
                                                            {agentOptions.map((agent) => (
                                                                <MenuItem key={agent.id} value={agent.id} sx={{ fontSize: "0.75rem" }}>
                                                                    <HiOutlineUserPlus className="mr-1.5 inline text-primary" /> {agent.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>

                                                        <Tooltip title="Reply to thread visitor">
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() => setSelectedReplyThread(thread)}
                                                                startIcon={<HiOutlinePaperAirplane />}
                                                                sx={{
                                                                    height: "32px",
                                                                    fontSize: "0.75rem",
                                                                    fontWeight: 700,
                                                                    textTransform: "none",
                                                                    bgcolor: "var(--primary)",
                                                                    color: "#ffffff",
                                                                    borderRadius: "8px",
                                                                    px: 2,
                                                                    boxShadow: "none",
                                                                    "&:hover": {
                                                                        bgcolor: "var(--primary-dark, #0284c7)",
                                                                    },
                                                                }}
                                                            >
                                                                Reply
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!overview.recent_threads.length && (
                                        <tr>
                                            <td className="px-5 py-12 text-center text-muted-foreground" colSpan={7}>
                                                No active conversations in this workspace yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            <ReplyThreadModal
                open={Boolean(selectedReplyThread)}
                thread={selectedReplyThread}
                onClose={() => setSelectedReplyThread(null)}
                onSuccess={loadData}
            />
        </div>
    );
};

export default Overview;
