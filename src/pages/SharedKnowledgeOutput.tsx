import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SectionCharts from "@/components/knowledge/generated-output/SectionCharts";
import SectionNotes from "@/components/knowledge/generated-output/SectionNotes";
import type { GeneratedOutput } from "@/services/knowledge/generatedOutputs";
import { getSharedOutput } from "@/services/knowledge/knowledgeOutputs";

const SharedKnowledgeOutput = () => {
    const { token = "" } = useParams();
    const [output, setOutput] = useState<GeneratedOutput | null>(null);
    const [error, setError] = useState("");
    useEffect(() => { getSharedOutput(token).then(setOutput).catch((requestError: unknown) => setError((requestError as { response?: { data?: { message?: string } } }).response?.data?.message || "This shared output is unavailable.")); }, [token]);
    if (error) return <main className="grid min-h-screen place-items-center bg-background p-6 text-center"><div><h1 className="text-2xl font-extrabold text-foreground">Shared output unavailable</h1><p className="text-muted-foreground">{error}</p></div></main>;
    if (!output) return <main className="grid min-h-screen place-items-center bg-background"><CircularProgress /></main>;
    return <main className="min-h-screen bg-background px-4 py-8 text-foreground"><div className="mx-auto grid max-w-6xl gap-5"><header className="rounded-2xl border border-border bg-surface p-6"><span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Shared {output.kind}</span><h1 className="mb-2 mt-2 text-3xl font-extrabold">{output.title}</h1><p className="m-0 text-sm leading-6 text-muted-foreground">{output.description}</p><p className="mb-0 mt-4 text-xs text-muted-foreground">Read-only shared output · Updated {new Date(output.updatedAt).toLocaleDateString()}</p></header>{output.sections.map((section, index) => <section key={section.schemaId} className="rounded-2xl border border-border bg-surface p-5 sm:p-6"><span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Section {index + 1}</span><h2 className="mb-2 mt-2 text-xl font-extrabold">{section.title}</h2><p className="mb-5 text-sm leading-6 text-muted-foreground">{section.description}</p><div className={`grid items-start gap-5 ${section.charts.length ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.8fr)]" : ""}`}><SectionNotes notes={section.notes} /><SectionCharts charts={section.charts} /></div></section>)}</div></main>;
};
export default SharedKnowledgeOutput;
