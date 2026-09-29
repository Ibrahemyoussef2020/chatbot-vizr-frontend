import FinalCta from "@/components/landing/home/final-cta/FinalCta";
import Hero from "@/components/landing/home/hero/Hero";
import Reveal from "@/components/landing/shared/Reveal";
import SectionRenderer from "@/components/landing/shared/SectionRenderer";
import { useLandingPage } from "@/hooks/useLandingPage";
import type { ContentSection, LandingSectionItem } from "@/services/core/landing";

const sectionOrder = [
    "commerce",
    "benefits",
    "channels",
    "capabilities",
    "journey",
    "analytics",
    "steps",
    "roi",
    "workflow",
    "industries",
    "ecosystem",
    "comparison",
];

const sortSections = (sections: ContentSection[]) => (
    [...sections]
        .filter((section) => !["heroDemo", "trust"].includes(section.type))
        .sort((first, second) => sectionOrder.indexOf(first.type) - sectionOrder.indexOf(second.type))
);

const HomeSkeleton = () => (
    <main className="min-h-[65vh] animate-pulse bg-background" aria-busy="true" aria-label="Loading home page">
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
            <div className="space-y-5"><div className="h-4 w-36 rounded-full bg-surface-muted" /><div className="space-y-3"><div className="h-12 w-full rounded-xl bg-surface-muted" /><div className="h-12 w-4/5 rounded-xl bg-surface-muted" /></div><div className="space-y-2"><div className="h-4 w-full rounded bg-surface-muted" /><div className="h-4 w-11/12 rounded bg-surface-muted" /><div className="h-4 w-2/3 rounded bg-surface-muted" /></div><div className="h-12 w-44 rounded-xl bg-surface-muted" /></div>
            <div className="h-72 rounded-3xl bg-surface-muted lg:h-96" />
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-36 rounded-2xl bg-surface-muted" />)}</section>
        <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-48 rounded-2xl bg-surface-muted" />)}</section>
    </main>
);

const Home = () => {
    const { page, error, loading } = useLandingPage("home");

    if (loading) return <HomeSkeleton />;

    if (loading) {
        return <main className="grid min-h-[65vh] place-items-center text-muted-foreground" aria-busy="true">Loading…</main>;
    }

    if (!page) {
        return <main className="grid min-h-[65vh] place-items-center text-muted-foreground" role="alert">{error}</main>;
    }

    const heroDemo = (
        page.sections.find((section) => section.type === "heroDemo")?.items || []
    ) as LandingSectionItem[];
    const sections = sortSections(page.sections);

    return (
        <main className="landing-home relative w-full overflow-x-clip bg-background text-foreground">
            <div className="landing-ai-field" aria-hidden="true">
                <span className="landing-ai-orbit landing-ai-orbit-one" />
                <span className="landing-ai-orbit landing-ai-orbit-two" />
                <span className="landing-ai-node landing-ai-node-one" />
                <span className="landing-ai-node landing-ai-node-two" />
            </div>
            <Hero
                eyebrow={page.eyebrow}
                title={page.title}
                description={page.description}
                demoItems={heroDemo}
            />
            <div className="relative z-10">
                {sections.map((section, index) => (
                    <Reveal
                        key={section.type}
                        delay={(index % 3) * 70}
                        variant={["up", "left", "right", "zoom", "focus"][index % 5] as "up" | "left" | "right" | "zoom" | "focus"}
                    >
                        <SectionRenderer section={section} />
                    </Reveal>
                ))}
                <Reveal delay={100} variant="zoom">
                    <FinalCta />
                </Reveal>
            </div>
        </main>
    );
};

export default Home;
