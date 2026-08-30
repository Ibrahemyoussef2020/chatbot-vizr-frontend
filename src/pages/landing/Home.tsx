import FinalCta from "@/components/landing/home/final-cta/FinalCta";
import Hero from "@/components/landing/home/hero/Hero";
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

const Home = () => {
    const { page, error, loading } = useLandingPage("home");

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
        <main className="w-full overflow-x-clip bg-background text-foreground">
            <Hero
                eyebrow={page.eyebrow}
                title={page.title}
                description={page.description}
                demoItems={heroDemo}
            />
            {sections.map((section) => <SectionRenderer section={section} key={section.type} />)}
            <FinalCta />
        </main>
    );
};

export default Home;
