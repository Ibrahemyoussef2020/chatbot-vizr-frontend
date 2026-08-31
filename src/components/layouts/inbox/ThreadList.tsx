import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setStatusTab,
    setSelectedThread,
} from "@/redux/inboxSlice";
import type { ThreadItem } from "@/services/dashboard/analytics";

export interface ThreadListProps {
    search: string;
    onSearchChange: (search: string) => void;
    formatDate: (date?: string) => string;
}

export const ThreadList = ({
    search,
    onSearchChange,
    formatDate,
}: ThreadListProps) => {
    const dispatch = useAppDispatch();
    const { statusTab, loadingThreads, threadsData, selectedThread } = useAppSelector((state) => state.inbox);

    const handleSelectThread = (thread: ThreadItem) => {
        dispatch(setSelectedThread(thread));
    };

    const handleStatusTabChange = (tab: string) => {
        dispatch(setStatusTab(tab));
    };

    return (
        <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated flex flex-col lg:col-span-3 overflow-hidden">
            <div className="p-3 border-b border-border bg-surface-muted/50 space-y-2.5">
                <div className="relative">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-2.5 text-muted-foreground text-sm" />
                    <input
                        type="text"
                        placeholder="Search threads or visitors..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border">
                    {["all", "open", "closed"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleStatusTabChange(tab)}
                            className={`flex-1 rounded-lg py-1 text-[11px] font-bold capitalize transition-all ${
                                statusTab === tab
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
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
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-foreground truncate max-w-[130px]">
                                    {thread.user_name}
                                </span>
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

                            <div className="text-[11px] text-muted-foreground truncate mb-1">
                                {thread.user_email || "No email provided"}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold uppercase text-primary">
                                    {thread.received_from || "web"}
                                </span>
                                <span>{formatDate(thread.updated_at)}</span>
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
