import type { ComponentType } from "react";
import type { ChartKind, GeneratedChart } from "@/services/knowledge/generatedOutputs";
import BarChart from "./BarChart";
import DonutChart from "./DonutChart";
import TimelineChart from "./TimelineChart";

type ChartComponent = ComponentType<{ chart: GeneratedChart }>;

const chartRegistry: Record<ChartKind, ChartComponent> = {
    bars: BarChart,
    progress: BarChart,
    donut: DonutChart,
    timeline: TimelineChart,
};

const ChartFactory = ({ chart }: { chart: GeneratedChart }) => {
    const ChartComponent = chartRegistry[chart.kind];
    return <ChartComponent chart={chart} />;
};

export default ChartFactory;
