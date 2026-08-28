import PricingContent from "@/components/landing/pricing/PricingContent";
import { useLandingPage } from "@/hooks/useLandingPage";

const Pricing = () => {
    const { page, error, loading } = useLandingPage("pricing");

    if (loading) {
        return <main className="grid min-h-[65vh] place-items-center text-muted-foreground" aria-busy="true">Loading plans…</main>;
    }

    if (!page) {
        return <main className="grid min-h-[65vh] place-items-center text-muted-foreground" role="alert">{error}</main>;
    }

    return <PricingContent page={page} />;
};

export default Pricing;
