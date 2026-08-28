import type { CardItem } from "@/services/landing";
import type { SectionProps } from "../../shared/types";
import { HiOutlineChatBubbleLeftRight, HiOutlineShoppingBag, HiOutlineSparkles } from "react-icons/hi2";

const benefitIcons = [HiOutlineChatBubbleLeftRight, HiOutlineShoppingBag, HiOutlineSparkles];

const getItems = (section: SectionProps["section"]) => section.items as CardItem[];

export const BenefitsSection = ({ section }: SectionProps) => (
    <section className="mx-auto w-[min(1280px,calc(100%_-_2rem))] border-t border-border py-24 [&_.section-heading]:mb-8 [&_.section-heading]:max-w-3xl [&_.eyebrow]:font-extrabold [&_.eyebrow]:uppercase [&_.eyebrow]:tracking-[.15em] [&_.eyebrow]:text-accent [&_.section-heading_h2]:my-3 [&_.section-heading_h2]:text-[clamp(1.875rem,4vw,3rem)] [&_.benefits-grid]:grid [&_.benefits-grid]:grid-cols-3 [&_.benefits-grid]:gap-4 max-lg:[&_.benefits-grid]:grid-cols-2 max-sm:[&_.benefits-grid]:grid-cols-1 [&_article]:relative [&_article]:overflow-hidden [&_article]:rounded-2xl [&_article]:border [&_article]:border-border [&_article]:bg-surface [&_article]:p-6 [&_article]:transition [&_article:hover]:-translate-y-1 [&_article:hover]:border-primary [&_article>i]:mb-4 [&_article>i]:inline-grid [&_article>i]:h-11 [&_article>i]:w-11 [&_article>i]:place-items-center [&_article>i]:rounded-xl [&_article>i]:bg-[var(--theme-accent-faint)] [&_article>i]:text-primary [&_article>span]:text-xs [&_article>span]:font-extrabold [&_article>span]:uppercase [&_article>span]:text-primary [&_article>b]:absolute [&_article>b]:right-4 [&_article>b]:top-1 [&_article>b]:text-5xl [&_article>b]:text-muted [&_article_h3]:text-xl [&_article_p]:leading-7 [&_article_p]:text-muted-foreground [&_article>div]:flex [&_article>div]:flex-wrap [&_article>div]:gap-2 [&_article_small]:rounded-md [&_article_small]:border [&_article_small]:border-border [&_article_small]:px-2 [&_article_small]:py-1 [&_article_small]:text-xs [&_article_small]:text-muted-foreground">
        <div className="section-heading">
            <span className="eyebrow">
                {section.eyebrow || "What Vizr does for your business"}
            </span>
            <h2>{section.heading}</h2>
        </div>
        <div className="benefits-grid">
            {getItems(section).map((item, index) => (
                <article key={item.title}>
                    <i className="benefit-chat-icon">{(() => { const Icon = benefitIcons[index % benefitIcons.length]; return <Icon aria-hidden="true" />; })()}</i>
                    <span>{item.label}</span>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div>{item.tags?.map((tag) => <small key={tag}>{tag}</small>)}</div>
                </article>
            ))}
        </div>
    </section>
);
