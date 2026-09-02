import type { GeneratedSection } from "@/services/knowledge/generatedOutputs";

type Note = GeneratedSection["notes"][number];

const NoteCard = ({ note }: { note: Note }) => (
    <article className="rounded-xl border border-border bg-background p-4">
        <div className="mb-2 flex items-start justify-between gap-3"><h3 className="m-0 text-sm font-extrabold text-foreground">{note.title}</h3>{note.status && <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">{note.status}</span>}</div>
        <p className="m-0 text-xs leading-5 text-muted-foreground">{note.description}</p>
        {note.meta && <small className="mt-3 block border-t border-border pt-2 text-[10px] font-bold text-muted-foreground">{note.meta}</small>}
    </article>
);

const SectionNotes = ({ notes }: { notes: GeneratedSection["notes"] }) => notes.length ? <div className="grid gap-3 sm:grid-cols-2">{notes.map((note) => <NoteCard key={note.title} note={note} />)}</div> : null;

export default SectionNotes;
