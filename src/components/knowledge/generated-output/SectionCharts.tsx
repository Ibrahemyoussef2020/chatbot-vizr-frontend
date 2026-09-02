import ChartFactory from "./charts/ChartFactory";
import type { GeneratedSection } from "@/services/knowledge/generatedOutputs";

const SectionCharts = ({ charts }: { charts: GeneratedSection["charts"] }) => (
    <>{charts.map((chart) => <figure key={chart.title} className="m-0 rounded-xl border border-border bg-background p-4"><figcaption className="mb-5"><strong className="block text-sm text-foreground">{chart.title}</strong>{chart.description && <span className="mt-1 block text-xs text-muted-foreground">{chart.description}</span>}</figcaption><ChartFactory chart={chart} /></figure>)}</>
);

export default SectionCharts;
