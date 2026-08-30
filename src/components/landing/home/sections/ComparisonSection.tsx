import { sectionClass } from "../../shared/styles";
import type { ComparisonItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

type ComparisonSummary = Pick<ComparisonItem, "title" | "description">;

export const ComparisonSection = ({ section }: SectionProps) => {
    const items = section.items as ComparisonItem[];
    const negative = items.filter((item) => item.status === "negative");
    const positive = items.filter((item) => item.status === "positive");
    const privacy: ComparisonSummary = {
        title: "Public model risks",
        description: "Sensitive customer questions may be exposed to systems that are not isolated around your business.",
    };
    const isolation: ComparisonSummary = {
        title: "100% private data isolation",
        description: "Your content remains in isolated business namespaces and is never used for public model training.",
    };

    return (
        <section className={sectionClass}>
            <div className="center-heading">
                <span className="eyebrow">{section.eyebrow}</span>
                <h2>{section.heading}</h2>
                <p>{section.description}</p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 max-sm:grid-cols-1 [&>article]:relative [&>article]:rounded-3xl [&>article]:border [&>article]:border-border [&>article]:bg-surface [&>article]:p-8 [&>article.positive]:border-2 [&>article.positive]:border-primary">
                <ComparisonCard title="Generic AI (ChatGPT)" items={[negative[0], negative[1], privacy, negative[2]]} />
                <ComparisonCard title="Vizr Platform" items={[positive[0], positive[1], isolation, positive[2]]} positive />
            </div>
        </section>
    );
};

type ComparisonCardProps = {
    title: string;
    items: ComparisonSummary[];
    positive?: boolean;
};

const ComparisonCard = ({ title, items, positive = false }: ComparisonCardProps) => (
    <article className={positive ? "positive" : "negative"}>
        {positive && <b className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[.6rem] uppercase tracking-wider text-primary-foreground">Built For Business</b>}
        <h3 className={`mb-6 mt-0 text-lg ${positive ? "text-primary" : "text-muted-foreground"}`}>{title}</h3>
        <div className="grid gap-4">
            {items.map((item) => (
                <section className="flex items-start gap-3" key={item.title}>
                    <i className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black not-italic ${positive ? "bg-[var(--theme-accent-faint)] text-primary" : "bg-red-500/10 text-danger"}`}>{positive ? "✓" : "×"}</i>
                    <p className="m-0 text-sm leading-6 text-muted-foreground"><strong className="mb-1 block text-foreground">{item.title}</strong>{item.description}</p>
                </section>
            ))}
        </div>
    </article>
);
