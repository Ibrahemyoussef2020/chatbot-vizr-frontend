import { sectionClass } from "../../shared/styles";
import { useState } from "react";
import type { CardItem } from "@/services/landing";
import SlideControls from "../../shared/SlideControls";
import type { SectionProps } from "../../shared/types";

export const ExplorerSection = ({ section }: SectionProps) => {
    const items = section.items as CardItem[];
    const [selected, setSelected] = useState(0);
    const item = items[selected];

    return (
        <section className={sectionClass} id="capabilities">
            <div className="center-heading">
                <span className="eyebrow">{section.eyebrow}</span>
                <h2>{section.heading}</h2>
                <p>{section.description}</p>
            </div>
            <div className="showcase-tabs centered !justify-center" role="tablist">
                {items.map((entry, index) => (
                    <button type="button" role="tab" aria-selected={selected === index} onClick={() => setSelected(index)} key={entry.label}>
                        {entry.label}
                    </button>
                ))}
            </div>
            <div key={selected}>
                <article className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface p-8 text-center">
                    <span className="text-xs font-extrabold uppercase tracking-[.15em] text-primary">{item.label}</span>
                    <h3 className="mx-auto my-3 max-w-2xl text-3xl font-black text-foreground">{item.title}</h3>
                    <div className="mt-6 grid grid-cols-3 gap-4 max-lg:grid-cols-1 [&>div]:grid [&>div]:justify-items-center [&>div]:gap-3 [&>div]:rounded-2xl [&>div]:border [&>div]:border-border [&>div]:bg-surface-elevated [&>div]:p-5 [&>div]:text-center [&_b]:text-xs [&_b]:font-extrabold [&_b]:uppercase [&_b]:tracking-wider [&_b]:text-primary [&_strong]:text-lg [&_strong]:text-foreground [&_p]:m-0 [&_p]:text-sm [&_p]:leading-7 [&_p]:text-muted-foreground">
                        <CapabilityStage label="Discover" title="Understand the request" text={item.description} />
                        <CapabilityStage label="Assist" title="Use trusted context" text="Combine business data, customer history and approved knowledge." />
                        <CapabilityStage label="Resolve" title="Complete or hand off" text="Act immediately or transfer ownership without losing context." />
                    </div>
                    <footer className="mt-7 flex flex-col items-center justify-center gap-4 border-t border-border pt-6 text-center [&_p]:m-0 [&_p]:leading-7 [&_p]:text-muted-foreground [&_a]:shrink-0 [&_a]:rounded-xl [&_a]:bg-primary [&_a]:px-4 [&_a]:py-3 [&_a]:text-sm [&_a]:font-extrabold [&_a]:text-primary-foreground [&_a]:no-underline">
                        <p>Want the technical details? Explore all {String(item.label).toLowerCase()} capabilities.</p>
                        <a href="/auth/register">Explore {item.label} →</a>
                    </footer>
                </article>
            </div>
            <SlideControls className="max-w-4xl" current={selected} count={items.length} onChange={setSelected} />
        </section>
    );
};

const CapabilityStage = ({ label, title, text }: { label: string; title: string; text?: string }) => (
    <div><b>{label}</b><strong>{title}</strong><p>{text}</p></div>
);
