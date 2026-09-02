import SectionCharts from "./SectionCharts";
import SectionNotes from "./SectionNotes";
import SectionActions from "./SectionActions";
import type { EditMode } from "@/services/knowledge/knowledgeOutputs";
import type { GeneratedSectionInput } from "@/services/knowledge/generatedOutputs";
import type { GeneratedSection } from "@/services/knowledge/generatedOutputs";

interface Props { section: GeneratedSection; index: number; busy: boolean; onRetry: () => Promise<void>; onEdit: (mode: EditMode, payload: GeneratedSectionInput | { instruction: string }) => Promise<void>; onRemove: () => Promise<void>; }

const GeneratedSectionView = ({ section, index, busy, onRetry, onEdit, onRemove }: Props) => (
    <section id={section.id} className="scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <header className="mb-5"><div className="mb-2 flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-primary">Section {String(index + 1).padStart(2, "0")} · {section.status}</span><SectionActions section={section} busy={busy} onRetry={onRetry} onEdit={onEdit} onRemove={onRemove} /></div><h2 className="mb-2 mt-1 text-xl font-extrabold text-foreground">{section.title}</h2><p className="m-0 max-w-4xl text-sm leading-6 text-muted-foreground">{section.description}</p></header>
        {section.status === "failed" ? <div role="alert" className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">{section.error || "This schema failed to generate. Retry only this schema without regenerating the full output."}</div> : section.status === "generating" ? <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm font-bold text-primary">This schema is being generated...</div> : <div className={`grid items-start gap-5 ${section.charts.length ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.8fr)]" : ""}`}><SectionNotes notes={section.notes} /><SectionCharts charts={section.charts} /></div>}
    </section>
);

export default GeneratedSectionView;
