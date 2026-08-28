import { useState } from "react";
import type { LandingPageContent, PlanItem } from "@/services/landing";
import PricingGrid from "./PricingGrid";
import PricingHero from "./PricingHero";
import type { BillingCycle } from "./types";

interface PricingContentProps {
    page: LandingPageContent;
}

const PricingContent = ({ page }: PricingContentProps) => {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const plansSection = page.sections.find((section) => section.type === "plans");
    const plans = (plansSection?.items || []) as PlanItem[];

    return (
        <main className="mx-auto w-[calc(100%_-_2rem)] max-w-7xl py-20 pb-32 max-sm:py-14">
            <PricingHero
                eyebrow={page.eyebrow}
                title={page.title}
                description={page.description}
                billingCycle={billingCycle}
                onBillingCycleChange={setBillingCycle}
            />
            <PricingGrid plans={plans} billingCycle={billingCycle} />
        </main>
    );
};

export default PricingContent;
