import { sectionClass } from "../../shared/styles";
import { useState } from "react";
import type { AnalyticsItem } from "@/services/landing";
import type { SectionProps } from "../../shared/types";

type AnalyticsRange = "7d" | "30d" | "6m";

const analyticsRanges: Record<AnalyticsRange, { factor: number; change: string; points: string }> = {
    "7d": {
        factor: 0.24,
        change: "this week",
        points: "0,88 55,72 110,76 165,51 220,58 275,31 330,38 385,16 440,22 495,8",
    },
    "30d": {
        factor: 1,
        change: "this month",
        points: "0,91 55,82 110,63 165,69 220,42 275,49 330,25 385,31 440,13 495,4",
    },
    "6m": {
        factor: 5.8,
        change: "in six months",
        points: "0,96 55,86 110,89 165,70 220,62 275,46 330,51 385,29 440,18 495,5",
    },
};

const customerTrend = "0,105 55,92 110,98 165,79 220,74 275,59 330,63 385,45 440,36 495,24";

export const AnalyticsSection = ({ section }: SectionProps) => {
    const items = section.items as AnalyticsItem[];
    const baseMetrics = items.slice(0, 4);
    const channels = items.slice(4);
    const [range, setRange] = useState<AnalyticsRange>("30d");
    const [activeChannel, setActiveChannel] = useState(0);
    const report = analyticsRanges[range];
    const selectedChannel = channels[activeChannel];
    const metrics = baseMetrics.map((metric, index) => {
        if (index >= 2) return metric;
        const value = Number(String(metric.value).replaceAll(",", ""));
        return { ...metric, value: Math.round(value * report.factor).toLocaleString() };
    });

    return (
        <section className={sectionClass}>
            <div className="split-heading">
                <div>
                    <span className="eyebrow">{section.eyebrow}</span>
                    <h2>{section.heading}</h2>
                    <p>{section.description}</p>
                </div>
                
            </div>
            <div className="flex items-center justify-between gap-4 rounded-t-2xl border border-b-0 border-border bg-surface p-4 [&_small]:text-muted-foreground">
                <div>
                    <strong>Live performance overview</strong>
                    <small>Updated just now Â· {report.change}</small>
                </div>
                <div className="flex rounded-xl border border-border bg-surface-muted p-1" role="group" aria-label="Analytics date range">
                    {(Object.keys(analyticsRanges) as AnalyticsRange[]).map((value) => (
                        <button
                            type="button"
                            aria-pressed={range === value}
                            onClick={() => setRange(value)}
                            className={`rounded-lg border-0 px-3 py-2 text-xs font-black ${range === value ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"}`}
                            key={value}
                        >
                            {value.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <div className="rounded-b-2xl border border-border bg-surface p-6">
                <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1 [&_article]:grid [&_article]:gap-1 [&_article]:rounded-xl [&_article]:border [&_article]:border-border [&_article]:bg-surface-elevated [&_article]:p-4 [&_strong]:text-2xl [&_span]:text-sm [&_span]:text-success [&_p]:text-sm [&_p]:text-muted-foreground">
                    {metrics.map((item, index) => (
                        <article style={{ animationDelay: `${index * 80}ms` }} key={item.label}>
                            <small>{item.label}</small>
                            <strong>{item.value}</strong>
                            <span>{item.change}</span>
                            <p>{item.description}</p>
                        </article>
                    ))}
                </div>
                <div className="mt-4 grid grid-cols-[1.5fr_.75fr] gap-4 max-lg:grid-cols-1">
                    <TrendChart points={report.points} />
                    <aside className="grid content-start gap-3 rounded-xl border border-border bg-surface-elevated p-5">
                        <h3>Conversations by channel</h3>
                        <div className="grid gap-1 rounded-xl border border-[var(--theme-accent-medium)] bg-[var(--theme-accent-faint)] p-3 [&_span]:text-xs [&_span]:font-black [&_span]:uppercase [&_span]:text-primary [&_strong]:text-xl [&_small]:text-muted-foreground">
                            <span>{selectedChannel.label}</span>
                            <strong>{selectedChannel.value}</strong>
                            <small>{selectedChannel.description}</small>
                        </div>
                        {channels.map((item, index) => (
                            <button
                                type="button"
                                aria-pressed={activeChannel === index}
                                onClick={() => setActiveChannel(index)}
                                className={`grid gap-1 rounded-lg border-0 p-2 text-foreground ${activeChannel === index ? "bg-surface-muted" : "bg-transparent"}`}
                                key={item.label}
                            >
                                <div className="flex justify-between text-xs"><span>{item.label}</span><strong>{item.value}</strong></div>
                                <i className="h-1.5 overflow-hidden rounded-full bg-muted"><b className="block h-full rounded-full bg-primary" style={{ width: String(item.value) }} /></i>
                            </button>
                        ))}
                    </aside>
                </div>
            </div>
        </section>
    );
};

const TrendChart = ({ points }: { points: string }) => (
    <article className="rounded-xl border border-border bg-surface-elevated p-5">
        <header className="flex justify-between gap-4 max-sm:flex-col">
            <div className="grid gap-1"><strong>Customer & conversation growth</strong><small className="text-xs text-muted-foreground">Monthly activity</small></div>
            <div className="flex gap-4 text-xs text-muted-foreground"><span>● Conversations</span><span>● Customers</span></div>
        </header>
        <svg className="mt-5 h-48 w-full border-b border-border" viewBox="0 0 500 120" preserveAspectRatio="none" role="img" aria-label="Conversation growth trend">
            <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--theme-accent)" stopOpacity=".35" />
                    <stop offset="1" stopColor="var(--theme-accent)" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={`M ${points.replaceAll(" ", " L ")} L 495,120 L 0,120 Z`} fill="url(#chart-fill)" />
            <polyline points={points} fill="none" stroke="var(--theme-accent)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <polyline points={customerTrend} fill="none" stroke="#36d79a" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        <footer className="flex justify-between pt-2 text-[.625rem] text-muted-foreground">{["Start", "Week 1", "Week 2", "Week 3", "Now"].map((label) => <span key={label}>{label}</span>)}</footer>
    </article>
);
