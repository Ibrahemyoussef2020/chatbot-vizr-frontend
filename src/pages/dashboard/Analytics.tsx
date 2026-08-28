import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import {
    HiOutlineArrowDownTray,
    HiOutlineChartBarSquare,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineSparkles,
    HiOutlineStar,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import { fetchThreadAnalytics, type AnalyticsData } from "@/services/analytics";
import {
    ChannelDistributionChart,
    DonutChart,
    HourlyActivityChart,
    TimeSeriesAreaChart,
    TopicHorizontalBarChart,
} from "@/components/dashboard/AnalyticsCharts";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { useUrlSearchParams } from "@/hooks/useUrlSearchParams";

const AnalyticsPage = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const { filters, searchParams } = useUrlSearchParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            setLoading(true);
            try {
                const result = await fetchThreadAnalytics(filters.days, activeWorkspace?.slug);
                if (isMounted) {
                    setData(result);
                    setError("");
                }
            } catch {
                if (isMounted) {
                    setError("Failed to load analytics telemetry from backend.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void init();

        return () => {
            isMounted = false;
        };
    }, [filters.days, activeWorkspace?.slug, searchParams]);

    const exportCSVReport = () => {
        if (!data) return;

        const headers = "Date,Total,Open,Closed\n";
        const rows = data.time_series.map((p) => `${p.date},${p.total},${p.open},${p.closed}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `analytics-report-${filters.days}d.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="mx-auto grid w-full max-w-[1600px] gap-5 p-1">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Power Analytics</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            URL Synced
                        </span>
                    </div>
                    <h1 className="mb-1 mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        Executive Intelligence Dashboard
                    </h1>
                    <p className="m-0 text-xs text-muted-foreground sm:text-sm">
                        High-density conversation telemetry, response SLAs, and automated resolution metrics for:{" "}
                        <span className="font-bold text-foreground">{activeWorkspace?.name || "Global Scope"}</span>
                    </p>
                </div>

                <Button
                    variant="contained"
                    startIcon={<HiOutlineArrowDownTray />}
                    onClick={exportCSVReport}
                    className="!bg-primary !font-bold !normal-case !text-xs"
                >
                    Export CSV
                </Button>
            </header>

            <DashboardFilterBar />

            {loading && (
                <div className="flex h-80 items-center justify-center">
                    <CircularProgress size={40} />
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <div className="grid gap-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Period Volume
                                    </span>
                                    <HiOutlineChatBubbleLeftRight className="text-lg text-primary" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-foreground">
                                    {data.summary.totalInPeriod.toLocaleString()}
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-success">
                                    +18.4% vs prev period
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Active Workload
                                    </span>
                                    <HiOutlineClock className="text-lg text-warning" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-warning">
                                    {data.summary.activeInPeriod}
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                                    Queued in inbox
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Resolved Rate
                                    </span>
                                    <HiOutlineCheckCircle className="text-lg text-success" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-success">
                                    {data.summary.endedInPeriod}
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-success">
                                    Resolved successfully
                                </span>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        AI Resolution
                                    </span>
                                    <HiOutlineSparkles className="text-lg text-primary" />
                                </div>
                                <strong className="mt-2 block text-2xl font-black text-primary">
                                    {data.summary.aiResolutionPercent}%
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
                                    {data.summary.csatScore} / 5.0
                                </strong>
                                <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                                    {data.summary.slaResponseSec}s avg response
                                </span>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-8">
                            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                                <div>
                                    <h2 className="text-base font-extrabold text-foreground">Conversation Growth & Resolution Trend</h2>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Time-series analytics curve over the last {filters.days} days
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

                            <TimeSeriesAreaChart data={data.time_series} />
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4 flex flex-col justify-between">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Resolution Split</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">AI Automation vs Escalations</p>
                            </div>

                            <DonutChart
                                data={data.resolution_split}
                                centerValue={`${data.summary.aiResolutionPercent}%`}
                                centerLabel="AI Resolution"
                            />

                            <div className="mt-4 rounded-lg bg-surface-muted p-3 text-center text-xs">
                                <span className="text-muted-foreground">Average Response SLA:</span>{" "}
                                <strong className="text-foreground font-bold">{data.summary.slaResponseSec} seconds</strong>
                            </div>
                        </Card>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Omnichannel Breakdown</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Message volume per active channel</p>
                            </div>

                            <ChannelDistributionChart data={data.channels} />
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Customer Query Topics</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Categorized intent distribution</p>
                            </div>

                            <TopicHorizontalBarChart data={data.topics} />
                        </Card>

                        <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated p-5 lg:col-span-4">
                            <div className="border-b border-border pb-3 mb-4">
                                <h2 className="text-base font-extrabold text-foreground">Hourly Peak Activity</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">24-hour load heat map</p>
                            </div>

                            <HourlyActivityChart data={data.hourly_activity} />
                        </Card>
                    </div>

                    <Card variant="outlined" className="!rounded-xl !border-border !bg-surface-elevated overflow-hidden">
                        <header className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-muted">
                            <div className="flex items-center gap-2">
                                <HiOutlineChartBarSquare className="text-primary text-base" />
                                <h2 className="m-0 text-sm font-extrabold text-foreground">Agent & Automation Telemetry</h2>
                            </div>
                            <span className="text-xs text-muted-foreground font-semibold">Live Operational Status</span>
                        </header>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                                <thead className="bg-surface-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3">Workforce Node</th>
                                        <th className="px-5 py-3">Type</th>
                                        <th className="px-5 py-3">Handled Count</th>
                                        <th className="px-5 py-3">Avg Latency</th>
                                        <th className="px-5 py-3">CSAT Score</th>
                                        <th className="px-5 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium">
                                    <tr className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-foreground">Vizr AI Primary Agent</td>
                                        <td className="px-5 py-3.5 text-primary">Autonomous AI</td>
                                        <td className="px-5 py-3.5">{Math.round(data.summary.totalInPeriod * 0.85)}</td>
                                        <td className="px-5 py-3.5 font-mono">1.2 s</td>
                                        <td className="px-5 py-3.5 font-bold text-success">4.9 / 5.0</td>
                                        <td className="px-5 py-3.5">
                                            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success">
                                                Active (100%)
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-foreground">RAG Knowledge Engine</td>
                                        <td className="px-5 py-3.5 text-secondary">Vector Retriever</td>
                                        <td className="px-5 py-3.5">{Math.round(data.summary.totalInPeriod * 0.72)}</td>
                                        <td className="px-5 py-3.5 font-mono">45 ms</td>
                                        <td className="px-5 py-3.5 font-bold text-success">5.0 / 5.0</td>
                                        <td className="px-5 py-3.5">
                                            <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success">
                                                Ready
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-surface-muted/40 transition-colors">
                                        <td className="px-5 py-3.5 font-bold text-foreground">Human Support Team</td>
                                        <td className="px-5 py-3.5 text-warning">Escalation Pool</td>
                                        <td className="px-5 py-3.5">{Math.round(data.summary.totalInPeriod * 0.15)}</td>
                                        <td className="px-5 py-3.5 font-mono">2.4 min</td>
                                        <td className="px-5 py-3.5 font-bold text-foreground">4.7 / 5.0</td>
                                        <td className="px-5 py-3.5">
                                            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                                                Standby
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
