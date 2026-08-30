import type { CardItem } from "@/services/core/landing";

interface ValuesSectionProps {
    heading?: string;
    values: CardItem[];
}

const ValuesSection = ({ heading, values }: ValuesSectionProps) => (
    <section className="py-20" aria-labelledby="about-values-title">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div>
                <span className="text-xs font-extrabold uppercase tracking-[.15em] text-accent">Our principles</span>
                <h2 className="mb-0 mt-2 text-3xl font-black text-foreground" id="about-values-title">{heading || "Our values"}</h2>
            </div>
            <p className="mb-0 mt-5 max-w-lg text-sm leading-7 text-muted-foreground lg:mt-0">The practical standards behind how we design automation, protect context and support customer-facing teams.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 md:gap-x-16">
            {values.map((value, index) => (
                <article className="grid grid-cols-[2.5rem_1fr] items-start gap-4 border-t border-border py-7 text-foreground" key={value.title}>
                    <span className="pt-1 text-xs font-black text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                        <h3 className="mb-2 mt-0 text-xl font-bold">{value.title}</h3>
                        <p className="m-0 text-sm leading-7 text-muted-foreground">{value.description}</p>
                    </div>
                </article>
            ))}
        </div>
    </section>
);

export default ValuesSection;
