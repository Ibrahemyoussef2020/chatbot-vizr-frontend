import { useState } from "react";
import type { ChannelItem, HourlyItem, ResolutionItem, TimeSeriesPoint, TopicItem } from "@/services/analytics";

interface TimeSeriesChartProps {
    data: TimeSeriesPoint[];
}

export const TimeSeriesAreaChart = ({ data }: TimeSeriesChartProps) => {
    const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

    if (!data || !data.length) {
        return (
            <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
                No time-series data recorded for this window.
            </div>
        );
    }

    const maxVal = Math.max(...data.map((d) => Math.max(d.total, d.open, d.closed, 1)), 1);
    const width = 600;
    const height = 220;
    const padding = 30;

    const pointsTotal = data
        .map((d, i) => {
            const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
            const y = height - padding - (d.total / maxVal) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(" ");

    const pointsClosed = data
        .map((d, i) => {
            const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
            const y = height - padding - (d.closed / maxVal) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(" ");

    const firstX = padding;
    const lastX = padding + (Math.max(data.length - 1, 1) / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const areaTotal = `${firstX},${height - padding} ${pointsTotal} ${lastX},${height - padding}`;

    return (
        <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = height - padding - ratio * (height - padding * 2);
                    return (
                        <line
                            key={ratio}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="var(--border)"
                            strokeDasharray="4 4"
                            strokeWidth="1"
                        />
                    );
                })}

                <polygon points={areaTotal} fill="url(#totalGradient)" className="transition-all duration-700" />

                <polyline
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsTotal}
                    className="transition-all duration-700"
                />

                <polyline
                    fill="none"
                    stroke="var(--secondary)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsClosed}
                    className="transition-all duration-700"
                />

                {data.map((d, i) => {
                    const x = padding + (i / Math.max(data.length - 1, 1)) * (width - padding * 2);
                    const y = height - padding - (d.total / maxVal) * (height - padding * 2);

                    return (
                        <circle
                            key={d.date}
                            cx={x}
                            cy={y}
                            r="4.5"
                            className="fill-surface stroke-primary stroke-2 cursor-pointer hover:r-7 transition-all duration-200"
                            onMouseEnter={() => setHoveredPoint(d)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    );
                })}
            </svg>

            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-2">
                <span>{data[0]?.date || ""}</span>
                {hoveredPoint && (
                    <span className="rounded bg-surface-muted px-2.5 py-1 text-foreground font-bold shadow-md border border-border">
                        {hoveredPoint.date}: {hoveredPoint.total} Total Conversations ({hoveredPoint.closed} Resolved)
                    </span>
                )}
                <span>{data[data.length - 1]?.date || ""}</span>
            </div>
        </div>
    );
};

interface DonutChartProps {
    data: ResolutionItem[];
    centerValue?: string;
    centerLabel?: string;
}

export const DonutChart = ({ data, centerValue = "88%", centerLabel = "AI Resolution" }: DonutChartProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

    const slices = data.reduce<Array<ResolutionItem & { dashArray: string; dashOffset: number }>>((acc, item) => {
        const previousAngleSum = acc.reduce((sum, prev) => sum + prev.value / total, 0);
        const percentage = item.value / total;
        acc.push({
            ...item,
            dashArray: `${percentage * 283} 283`,
            dashOffset: -previousAngleSum * 283,
        });
        return acc;
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative h-44 w-44">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                    {slices.map((slice) => (
                        <circle
                            key={slice.label}
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth="10"
                            strokeDasharray={slice.dashArray}
                            strokeDashoffset={slice.dashOffset}
                            className="transition-all duration-700 hover:opacity-85 hover:stroke-[12]"
                        />
                    ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <strong className="text-2xl font-black text-foreground tracking-tight">{centerValue}</strong>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {centerLabel}
                    </span>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-semibold">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.label}:</span>
                        <strong className="text-foreground">{item.value}%</strong>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface HorizontalBarChartProps {
    data: TopicItem[];
}

export const TopicHorizontalBarChart = ({ data }: HorizontalBarChartProps) => {
    return (
        <div className="space-y-3.5">
            {data.map((item) => (
                <div key={item.topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-foreground font-medium">{item.topic}</span>
                        <span className="text-muted-foreground font-mono">
                            {item.count} tickets ({item.sharePercent}%)
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-700 hover:bg-primary/90"
                            style={{ width: `${item.sharePercent}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ChannelBarChartProps {
    data: ChannelItem[];
}

export const ChannelDistributionChart = ({ data }: ChannelBarChartProps) => {
    return (
        <div className="space-y-4">
            {data.map((channel) => (
                <div key={channel.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="font-bold text-foreground">{channel.name}</span>
                        <span className="text-primary font-mono">{channel.count} msgs ({channel.sharePercent}%)</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-muted">
                        <div
                            className="h-full rounded-full bg-secondary transition-all duration-700"
                            style={{ width: `${Math.max(channel.sharePercent, 6)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

interface HourlyBarChartProps {
    data: HourlyItem[];
}

export const HourlyActivityChart = ({ data }: HourlyBarChartProps) => {
    if (!data || !data.length) {
        return (
            <div className="flex h-36 items-center justify-center text-xs text-muted-foreground">
                No hourly distribution data.
            </div>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="w-full">
            <div className="flex h-[130px] items-end justify-between gap-3 border-b border-border pb-1">
                {data.map((item) => {
                    const barHeightPx = Math.max(Math.round((item.count / maxCount) * 110), 18);

                    return (
                        <div
                            key={item.hour}
                            className="flex flex-1 flex-col items-center justify-end h-full"
                        >
                            <span className="mb-1 text-[10px] font-bold text-primary font-mono opacity-80">
                                {item.count}
                            </span>
                            <div
                                className="w-full max-w-[32px] rounded-t-md bg-primary hover:bg-primary/80 transition-all duration-500 cursor-pointer shadow-md hover:scale-105"
                                style={{ height: `${barHeightPx}px` }}
                                title={`${item.hour}: ${item.count} conversations`}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="mt-2.5 flex justify-between text-[11px] font-bold text-muted-foreground">
                {data.map((item) => (
                    <span key={item.hour} className="flex-1 text-center font-mono">
                        {item.hour}
                    </span>
                ))}
            </div>
        </div>
    );
};
