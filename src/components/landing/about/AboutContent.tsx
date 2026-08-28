import type { CardItem, LandingPageContent } from "@/services/landing";
import AboutHero from "./AboutHero";
import ValuesSection from "./ValuesSection";

interface AboutContentProps {
    page: LandingPageContent;
}

const AboutContent = ({ page }: AboutContentProps) => {
    const valuesSection = page.sections.find((section) => section.type === "values");
    const values = (valuesSection?.items || []) as CardItem[];
    const supportingSections = page.sections.filter((section) => section.type !== "values");

    return (
        <main className="w-full overflow-x-clip bg-background text-foreground">
            <div className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-16 sm:py-20">
                <AboutHero eyebrow={page.eyebrow} title={page.title} description={page.description} />
                <ValuesSection heading={valuesSection?.heading} values={values} />
            </div>
            <div className="border-t border-border">
                {supportingSections.map((section, sectionIndex) => (
                    <section className="mx-auto grid w-[calc(100%_-_2rem)] max-w-7xl gap-12 border-b border-border py-20 lg:grid-cols-[minmax(16rem,.72fr)_minmax(0,1.28fr)] lg:py-28" key={section.type}>
                        <header className="lg:sticky lg:top-28 lg:self-start">
                            <div>
                                {section.eyebrow && <span className="text-xs font-extrabold uppercase tracking-[.15em] text-accent">{section.eyebrow}</span>}
                                <h2 className="mb-0 mt-2 text-[clamp(1.875rem,4vw,3rem)] font-black leading-tight text-foreground">{section.heading}</h2>
                            </div>
                            {section.description && <p className="mb-0 mt-5 max-w-xl leading-7 text-muted-foreground">{section.description}</p>}
                        </header>
                        <div className="grid">
                            {section.items.map((item, index) => {
                                if (typeof item === "string" || !("title" in item)) return null;
                                return (
                                    <article className="grid gap-3 border-t border-border py-7 sm:grid-cols-[3rem_minmax(0,.7fr)_minmax(0,1fr)] sm:gap-6" key={`${section.type}-${item.title}-${index}`}>
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-primary">{String(sectionIndex + 1)}.{String(index + 1).padStart(2, "0")}</span>
                                        <h3 className="m-0 text-lg font-bold leading-7 text-foreground">{item.title}</h3>
                                        <p className="m-0 text-sm leading-7 text-muted-foreground">{"description" in item ? item.description : ""}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
};

export default AboutContent;
