import type { GeneratedChart } from "@/services/knowledge/generatedOutputs";
import { chartToneClasses } from "./chartTheme";

const BarChart = ({ chart }: { chart: GeneratedChart }) => (
    <div className="grid gap-4" role="img" aria-label={chart.title}>
        {chart.items.map((item) => (
            <div key={item.label} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-3">
                    <strong className="text-xs text-foreground">{item.label}</strong>
                    <span className="text-xs font-bold text-muted-foreground">{item.detail || `${item.value}%`}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                    <div className={`h-full rounded-full ${chartToneClasses[item.tone || "primary"]}`} style={{ width: `${Math.min(item.value, 100)}%` }} />
                </div>
            </div>
        ))}
    </div>
);

export default BarChart;
