import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useEffect, useState } from "react";
import { HiOutlineArrowDownTray, HiOutlineArrowPath, HiOutlineCommandLine } from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import { downloadSystemLogs, fetchSystemLogs, type LogItem } from "@/services/dashboard/logs";

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
    }).format(new Date(value));

const LogsPage = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [downloading, setDownloading] = useState<boolean>(false);

    const loadLogsData = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await fetchSystemLogs(
                levelFilter === "all" ? undefined : levelFilter,
                activeWorkspace?.slug,
            );
            setLogs(data);
        } catch {
            setError("Failed to fetch system logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const data = await fetchSystemLogs(
                    levelFilter === "all" ? undefined : levelFilter,
                    activeWorkspace?.slug,
                );
                if (isMounted) {
                    setLogs(data);
                    setError("");
                }
            } catch {
                if (isMounted) {
                    setError("Failed to fetch system logs.");
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
    }, [levelFilter, activeWorkspace?.slug]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadSystemLogs(activeWorkspace?.slug);
        } catch {
            setError("Log download failed.");
        } finally {
            setDownloading(false);
        }
    };

    const getLevelBadgeClass = (level: string) => {
        switch (level) {
            case "error":
                return "bg-danger/15 text-danger border-danger/30";
            case "warn":
                return "bg-warning/15 text-warning border-warning/30";
            default:
                return "bg-primary/15 text-primary border-primary/30";
        }
    };

    return (
        <div className="mx-auto grid w-full max-w-[1400px] gap-6 p-2">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                    <span className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">System Telemetry</span>
                    <h1 className="mb-1 mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                        Operational Logs & Diagnostics
                    </h1>
                    <p className="m-0 text-sm text-muted-foreground">
                        Realtime system trace logs, RAG vector searches, and API events for workspace:{" "}
                        <span className="font-semibold text-primary">{activeWorkspace?.name || "Global Scope"}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Select
                        size="small"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="!min-w-36 !text-sm !text-foreground"
                    >
                        <MenuItem value="all">All Log Levels</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="warn">Warnings</MenuItem>
                        <MenuItem value="error">Errors</MenuItem>
                    </Select>

                    <Button
                        variant="outlined"
                        startIcon={<HiOutlineArrowPath />}
                        onClick={loadLogsData}
                        disabled={loading}
                        className="!rounded-lg !normal-case !font-semibold"
                    >
                        Refresh
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<HiOutlineArrowDownTray />}
                        onClick={handleDownload}
                        disabled={downloading}
                        className="!bg-primary !font-bold !normal-case"
                    >
                        {downloading ? "Downloading…" : "Download Logs"}
                    </Button>
                </div>
            </header>

            {loading && (
                <div className="flex h-64 items-center justify-center">
                    <CircularProgress size={36} />
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger" role="alert">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated overflow-hidden">
                    <header className="flex items-center justify-between border-b border-border bg-surface-muted px-6 py-3.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <HiOutlineCommandLine className="text-primary text-base" /> Terminal System Output
                        </div>
                        <span className="text-xs text-muted-foreground">{logs.length} entries loaded</span>
                    </header>

                    <div className="p-4 bg-[#07131e] font-mono text-xs text-slate-200 overflow-x-auto min-h-[400px]">
                        <div className="space-y-2">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 rounded p-2 hover:bg-white/5 transition-colors border-b border-white/5"
                                >
                                    <span className="text-slate-500 shrink-0">{formatDate(log.createdAt)}</span>
                                    <span
                                        className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${getLevelBadgeClass(
                                            log.level,
                                        )}`}
                                    >
                                        {log.level}
                                    </span>
                                    <span className="text-primary/90 font-bold shrink-0">[{log.category}]</span>
                                    <span className="flex-1 text-slate-100 leading-relaxed">{log.message}</span>
                                </div>
                            ))}

                            {logs.length === 0 && (
                                <div className="py-16 text-center text-slate-400">
                                    No log entries found for the selected filter.
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default LogsPage;