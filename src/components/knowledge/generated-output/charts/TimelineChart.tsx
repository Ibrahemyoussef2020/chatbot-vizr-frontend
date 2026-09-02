import type { GeneratedChart } from "@/services/knowledge/generatedOutputs";
import { chartToneClasses } from "./chartTheme";

const TimelineChart = ({ chart }: { chart: GeneratedChart }) => (
    <ol className="m-0 grid list-none gap-4 p-0" aria-label={chart.title}>
        {chart.items.map((item, index) => (
            <li key={item.label} className="grid gap-2 sm:grid-cols-[28px_170px_minmax(120px,1fr)_70px] sm:items-center">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">{index + 1}</span>
                <strong className="text-xs text-foreground">{item.label}</strong>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                    <div className={`h-full rounded-full ${chartToneClasses[item.tone || "primary"]}`} style={{ width: `${Math.min(item.value, 100)}%` }} />
                </div>
                <small className="text-xs font-bold text-muted-foreground">{item.detail || `${item.value}%`}</small>
            </li>
        ))}
    </ol>
);

export default TimelineChart;
