import type { ReactNode } from "react";
import Card from "@mui/material/Card";
import { HiOutlineArrowPath, HiOutlineFunnel, HiOutlineXMark } from "react-icons/hi2";
import type { ThreadFilterParams } from "@/hooks/useUrlSearchParams";

interface InboxFilterSidebarProps {
    filters: ThreadFilterParams;
    setFilter: (key: keyof ThreadFilterParams, value: string | number) => void;
    resetFilters: () => void;
    onClose: () => void;
}

const fieldClass = "w-full rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none transition focus:border-primary";

export const InboxFilterSidebar = ({ filters, setFilter, resetFilters, onClose }: InboxFilterSidebarProps) => (
    <Card variant="outlined" className="!rounded-2xl !border-border !bg-surface-elevated flex flex-col overflow-hidden lg:col-span-2">
        <header className="flex items-center justify-between border-b border-border bg-surface-muted/50 px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground">
                <HiOutlineFunnel className="text-base text-primary" /> Filters
            </div>
            <button type="button" onClick={onClose} aria-label="Hide filters" className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground">
                <HiOutlineXMark />
            </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-3">
            <FilterField label="Status">
                <select className={fieldClass} value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                </select>
            </FilterField>
            <FilterField label="Received from">
                <select className={fieldClass} value={filters.channel} onChange={(e) => setFilter("channel", e.target.value)}>
                    <option value="all">All platforms</option>
                    <option value="web">Web</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                    <option value="gmail">Gmail</option>
                </select>
            </FilterField>
            <FilterField label="Last activity">
                <select className={fieldClass} value={filters.days} onChange={(e) => setFilter("days", Number(e.target.value))}>
                    <option value={1}>Last 24 hours</option>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={3650}>All time</option>
                </select>
            </FilterField>
            <FilterField label="Priority">
                <select className={fieldClass} value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
                    <option value="all">All priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </FilterField>
            <FilterField label="Order">
                <select className={fieldClass} value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
                    <option value="newest">Newest activity</option>
                    <option value="oldest">Oldest activity</option>
                </select>
            </FilterField>
        </div>

        <div className="border-t border-border p-3">
            <button type="button" onClick={resetFilters} className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary">
                <HiOutlineArrowPath /> Reset filters
            </button>
        </div>
    </Card>
);

const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
    <label className="block">
        <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</span>
        {children}
    </label>
);
