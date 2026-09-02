import { HiOutlineSparkles } from "react-icons/hi2";
import type { GeneratedChart } from "@/services/knowledge/generatedOutputs";
import { donutPalette } from "./chartTheme";

const DonutChart = ({ chart }: { chart: GeneratedChart }) => {
    const stops = chart.items.map((item, index) => {
        const start = chart.items.slice(0, index).reduce((total, entry) => total + entry.value, 0);
        return `${donutPalette[index % donutPalette.length]} ${start}% ${start + item.value}%`;
    }).join(", ");

    return (
        <div>
            <div className="mx-auto grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(${stops})` }} role="img" aria-label={`${chart.title}: ${chart.items.map((item) => `${item.label} ${item.value}%`).join(", ")}`}>
                <div className="grid h-28 w-28 place-items-center rounded-full bg-surface"><HiOutlineSparkles className="text-3xl text-primary" /></div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {chart.items.map((item, index) => <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground"><i className="h-2.5 w-2.5 rounded-full" style={{ background: donutPalette[index % donutPalette.length] }} /><span>{item.label}</span><b className="ml-auto text-foreground">{item.value}%</b></div>)}
            </div>
        </div>
    );
};

export default DonutChart;
