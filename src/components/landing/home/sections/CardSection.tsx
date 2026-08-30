import type { CardItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

const getItems = (section: SectionProps["section"]) => section.items as CardItem[];

export const CardSection = ({ section }: SectionProps) => {
    const items = getItems(section);



    return (
        <section className="mx-auto w-[min(1280px,calc(100%_-_2rem))] py-20 [&_.section-heading]:mb-8 [&_.section-heading]:max-w-3xl [&_.eyebrow]:font-extrabold [&_.eyebrow]:uppercase [&_.eyebrow]:tracking-[.15em] [&_.eyebrow]:text-accent [&_.section-heading_h2]:my-3 [&_.section-heading_h2]:text-[clamp(1.875rem,4vw,3rem)] [&_.section-heading_p]:leading-7 [&_.section-heading_p]:text-muted-foreground [&_.content-card-grid]:grid [&_.content-card-grid]:grid-cols-2 [&_.content-card-grid]:gap-4 max-sm:[&_.content-card-grid]:grid-cols-1 [&_article]:rounded-2xl [&_article]:border [&_article]:border-border [&_article]:bg-surface [&_article]:p-6 [&_article>span]:text-xs [&_article>span]:font-extrabold [&_article>span]:uppercase [&_article>span]:text-primary [&_article_h3]:text-xl [&_article_p]:leading-7 [&_article_p]:text-muted-foreground [&_.tag-list]:flex [&_.tag-list]:flex-wrap [&_.tag-list]:gap-2 [&_.tag-list_small]:rounded-md [&_.tag-list_small]:border [&_.tag-list_small]:border-border [&_.tag-list_small]:px-2 [&_.tag-list_small]:py-1 [&_.tag-list_small]:text-muted-foreground" id={section.type}>
            <div className="section-heading">
                {section.eyebrow && <span className="eyebrow">{section.eyebrow}</span>}
                <h2>{section.heading}</h2>
                {section.description && <p>{section.description}</p>}
            </div>
            <div className="content-card-grid">
                {items.map((item, index) => (
                    <article key={`${item.title}-${index}`}>
                        {(item.number || item.label) && (
                            <span>
                                {item.number}
                                {item.number && item.label ? " Â· " : ""}
                                {item.label}
                            </span>
                        )}
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        {item.tags?.length ? (
                            <div className="tag-list">
                                {item.tags.map((tag) => <small key={tag}>{tag}</small>)}
                            </div>
                        ) : null}
                    </article>
                ))}
            </div>
        </section>
    );
};
