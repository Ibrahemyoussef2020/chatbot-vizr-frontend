import { HiOutlineArrowRight, HiOutlineListBullet } from "react-icons/hi2";
import useSectionNavigation from "@/hooks/useSectionNavigation";
import type { GeneratedSection } from "@/services/knowledge/generatedOutputs";
import type { GeneratedOutputKind } from "@/hooks/useGeneratedOutput";

const OutputNavigation = ({ sections, kind }: { sections: GeneratedSection[]; kind: GeneratedOutputKind }) => {
    const { navigateToSection } = useSectionNavigation();
    return (
        <nav className="my-5 rounded-2xl border border-border bg-surface p-5 sm:p-6" aria-label={`${kind} sections`}>
            <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl text-primary"><HiOutlineListBullet /></span>
                <div><h2 className="m-0 text-base font-extrabold text-foreground">{kind === "plan" ? "Plan contents" : "Report contents"}</h2><p className="mb-0 mt-1 text-xs leading-5 text-muted-foreground">Choose a section below to move directly to its details, notes, and supporting charts.</p></div>
            </div>
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {sections.map((section, index) => (
                    <a key={section.id} href={`#${section.id}`} onClick={(event) => { event.preventDefault(); navigateToSection(section.id); }} className="group flex min-w-0 items-center gap-3 border-b border-border/70 py-3 text-sm font-bold text-foreground no-underline transition hover:border-primary hover:text-primary focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-muted text-[10px] font-extrabold text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1 truncate">{section.title}</span>
                        <HiOutlineArrowRight className="shrink-0 text-base text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                    </a>
                ))}
            </div>
        </nav>
    );
};

export default OutputNavigation;
