import { sectionClass } from "../../shared/styles";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { CardItem } from "@/services/landing";
import PlatformIcon from "../../shared/PlatformIcon";
import SlideControls from "../../shared/SlideControls";
import type { SectionProps } from "../../shared/types";

const commerceColors = ["#95bf47", "#96588a", "#4b71fc", "#f26322"];

export const CommerceSection = ({ section }: SectionProps) => {
    const items = section.items as CardItem[];
    const [selected, setSelected] = useState(0);
    const item = items[selected];
    const color = commerceColors[selected % commerceColors.length];

    return (
        <section className={sectionClass} id="integrations">
            <div className="split-heading">
                <div><span className="eyebrow">{section.eyebrow}</span><h2>{section.heading}</h2>
                    <p>{section.description}</p>

                </div>
            </div>
            <div className="showcase-tabs commerce-tabs" role="tablist">
                {items.map((entry, index) => {
                    const tabColor = commerceColors[index % commerceColors.length];
                    const activeStyle = selected === index
                        ? { borderColor: tabColor, boxShadow: `0 10px 30px ${tabColor}22` , color:`var(--foreground) `}
                        : undefined;
                    return (
                        <button className="inline-flex items-center justify-center gap-2.5" type="button" role="tab" aria-selected={selected === index} style={activeStyle} onClick={() => setSelected(index)} key={entry.title}>
                            <span className="grid h-5 w-5 shrink-0 place-items-center text-xl" style={{ color: tabColor }}><PlatformIcon name={entry.title} /></span>
                            <span>{entry.title}</span>
                        </button>
                    );
                })}
            </div>
            <div key={selected}>
                <article className="grid grid-cols-2 items-start gap-10 rounded-3xl border-2 bg-surface p-10 max-lg:grid-cols-1" style={{ borderColor: `${color}99` }}>
                    <div className="grid gap-4">
                        <span className="text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color }}>Priority integration</span>
                        <h3 className="flex items-center gap-3 text-[clamp(1.5rem,3vw,1.875rem)]">
                            <PlatformIcon name={item.title} />
                            {item.title} conversations with live business context.
                        </h3>
                        <p className="m-0 max-w-2xl leading-7 text-muted-foreground">{item.description}</p>
                        <Link className="inline-flex rounded-xl px-5 py-3 text-sm font-extrabold text-white no-underline" style={{ backgroundColor: color }} to="/auth/register">
                            Connect {item.title} →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 [&>strong]:flex [&>strong]:items-center [&>strong]:gap-3 [&>strong]:rounded-xl [&>strong]:border [&>strong]:border-border [&>strong]:bg-surface-muted [&>strong]:p-4 [&>strong]:text-sm [&>strong]:text-foreground [&_i]:grid [&_i]:h-6 [&_i]:w-6 [&_i]:shrink-0 [&_i]:place-items-center [&_i]:rounded-full [&_i]:text-xs [&_i]:not-italic [&_i]:text-white">
                        {item.tags?.map((tag) => (
                            <strong key={tag}><i style={{ backgroundColor: color }}>✓</i>{tag}</strong>
                        ))}
                    </div>
                </article>
            </div>
            <SlideControls current={selected} count={items.length} onChange={setSelected} />
        </section>
    );
};
