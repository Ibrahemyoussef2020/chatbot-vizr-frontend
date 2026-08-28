import AboutContent from "@/components/landing/about/AboutContent";
import { useLandingPage } from "@/hooks/useLandingPage";

const About = () => {
    const { page, error, loading } = useLandingPage("about");

    if (loading) {
        return <main className="grid min-h-[65vh] place-items-center text-muted-foreground" aria-busy="true">Loading…</main>;
    }

    if (!page) {
        return <main className="grid min-h-[65vh] place-items-center text-muted-foreground" role="alert">{error}</main>;
    }

    return <AboutContent page={page} />;
};

export default About;
