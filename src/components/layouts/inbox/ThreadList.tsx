import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { HiOutlineFunnel, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setSelectedThread } from "@/redux/inboxSlice";
import type { ThreadItem } from "@/services/dashboard/analytics";
import { ChannelBadge } from "./ChannelBadge";

export interface ThreadListProps {
    search: string;
    onSearchChange: (search: string) => void;
    formatDate: (date?: string) => string;
    filtersOpen: boolean;
    activeFilterCount: number;
    onToggleFilters: () => void;
}

export const ThreadList = ({
    search,
    onSearchChange,
    formatDate,
    filtersOpen,
    activeFilterCount,
    onToggleFilters,
}: ThreadListProps) => {
    const dispatch = useAppDispatch();
    const { loadingThreads, threadsData, selectedThread } = useAppSelector((state) => state.inbox);

    const handleSelectThread = (thread: ThreadItem) => {
        dispatch(setSelectedThread(thread));
    };

    return (
        <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated flex flex-col lg:col-span-3 overflow-hidden">
            <div className="border-b border-border bg-surface-muted/50 p-3">
                <div className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-muted-foreground text-sm" />
                    <input
                        type="text"
                        placeholder="Search threads or visitors..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    </div>
                    <button
                        type="button"
                        onClick={onToggleFilters}
                        aria-expanded={filtersOpen}
                        aria-label="Toggle conversation filters"
                        className={`relative grid h-8 w-9 shrink-0 place-items-center rounded-xl border transition ${filtersOpen || activeFilterCount > 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                    >
                        <HiOutlineFunnel />
                        {activeFilterCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">{activeFilterCount}</span>}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border">
                {loadingThreads && (
                    <div className="flex h-40 items-center justify-center">
                        <CircularProgress size={24} />
                    </div>
                )}

                {!loadingThreads && (threadsData?.threads || []).map((thread) => {
                    const isSelected = selectedThread?.id === thread.id;
                    const priority = thread.priority || "medium";

                    return (
                        <div
                            key={thread.id}
                            onClick={() => handleSelectThread(thread)}
                            className={`p-3.5 cursor-pointer transition-all ${
                                isSelected
                                    ? "bg-primary/10 border-l-4 border-l-primary"
                                    : "hover:bg-surface-muted/40"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex min-w-0 items-center gap-2">
                                    <ChannelBadge channel={thread.received_from} compact />
                                    <span className="truncate text-xs font-bold text-foreground">
                                        {thread.user_name}
                                    </span>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                        priority === "high"
                                            ? "bg-danger/15 text-danger"
                                            : priority === "medium"
                                            ? "bg-warning/15 text-warning"
                                            : "bg-info/15 text-info"
                                    }`}
                                >
                                    {priority.toUpperCase()}
                                </span>
                            </div>

                            <div className="mb-1 truncate text-[11px] text-muted-foreground">
                                {thread.latest_message || "No messages yet"}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <ChannelBadge channel={thread.received_from} />
                                <span>{formatDate(thread.latest_message_at || thread.updated_at)}</span>
                            </div>
                        </div>
                    );
                })}

                {!loadingThreads && !threadsData?.threads.length && (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                        No matching conversations found.
                    </div>
                )}
            </div>
        </Card>
    );
};
