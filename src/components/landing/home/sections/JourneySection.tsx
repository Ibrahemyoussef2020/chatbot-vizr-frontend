import type { CardItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

const getItems = (section: SectionProps["section"]) => section.items as CardItem[];

export const JourneySection = ({ section }: SectionProps) => (
    <section className="mx-auto w-[min(1280px,calc(100%_-_2rem))] border-t border-border p-10 [&_.split-heading]:mb-8 [&_.split-heading]:grid [&_.split-heading]:grid-cols-2 [&_.split-heading]:items-end [&_.split-heading]:gap-12 max-md:[&_.split-heading]:grid-cols-1 [&_.eyebrow]:font-extrabold [&_.eyebrow]:uppercase [&_.eyebrow]:tracking-[.15em] [&_.eyebrow]:text-accent [&_.split-heading_h2]:my-3 [&_.split-heading_h2]:text-[clamp(1.875rem,4vw,3rem)] [&_.split-heading>p]:leading-7 [&_.split-heading>p]:text-muted-foreground [&_.journey-grid]:grid [&_.journey-grid]:grid-cols-4 [&_.journey-grid]:gap-4 max-lg:[&_.journey-grid]:grid-cols-2 max-sm:[&_.journey-grid]:grid-cols-1 [&_.journey-grid_article]:relative [&_.journey-grid_article]:min-h-60 [&_.journey-grid_article]:rounded-2xl [&_.journey-grid_article]:border [&_.journey-grid_article]:border-border [&_.journey-grid_article]:bg-surface [&_.journey-grid_article]:p-6 [&_.journey-grid_article>i]:grid [&_.journey-grid_article>i]:h-8 [&_.journey-grid_article>i]:w-8 [&_.journey-grid_article>i]:place-items-center [&_.journey-grid_article>i]:rounded-lg [&_.journey-grid_article>i]:bg-[var(--theme-accent-faint)] [&_.journey-grid_article>i]:text-primary [&_.journey-grid_article>span]:mt-5 [&_.journey-grid_article>span]:block [&_.journey-grid_article>span]:text-xs [&_.journey-grid_article>span]:font-black [&_.journey-grid_article>span]:uppercase [&_.journey-grid_article>span]:text-secondary [&_.journey-grid_article_p]:text-sm [&_.journey-grid_article_p]:leading-7 [&_.journey-grid_article_p]:text-muted-foreground [&_.journey-grid_article>b]:absolute [&_.journey-grid_article>b]:bottom-5 [&_.journey-grid_article>b]:right-6 [&_.journey-grid_article>b]:text-primary">
        <div className="split-heading">
            <div>
                <span className="eyebrow">{section.eyebrow}</span>
                <h2>{section.heading}</h2>
                <p>Stay useful from the first product question through purchase, support and high-value human escalation.</p>

            </div>
        </div>
        <div className="journey-grid">
            {getItems(section).map((item, index) => (
                <article key={item.title}>
                    <i>{index + 1}</i>
                    <span>{item.label}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <b aria-hidden="true">→</b>
                </article>
            ))}
        </div>
    </section>
);
