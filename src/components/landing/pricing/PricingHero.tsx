import type { BillingCycle } from "./types";

interface PricingHeroProps {
    eyebrow?: string;
    title: string;
    description?: string;
    billingCycle: BillingCycle;
    onBillingCycleChange: (cycle: BillingCycle) => void;
}

const billingCycles: BillingCycle[] = ["monthly", "yearly"];

const PricingHero = ({
    eyebrow,
    title,
    description,
    billingCycle,
    onBillingCycleChange,
}: PricingHeroProps) => (
    <section className="mx-auto mb-16 max-w-[850px] text-center">
        {eyebrow && <span className="text-xs font-extrabold uppercase tracking-[.15em] text-[var(--theme-accent)]">{eyebrow}</span>}
        <h1 className="my-3 text-[clamp(1.875rem,4vw,3rem)] font-extrabold leading-[1.15]">{title}</h1>
        {description && <p className="mx-auto max-w-2xl text-base leading-7 text-[var(--theme-copy)]">{description}</p>}
        <div className="mx-auto mt-5 flex w-max gap-1 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-soft)] p-1" role="group" aria-label="Billing period">
            {billingCycles.map((cycle) => (
                <Button
                    aria-pressed={billingCycle === cycle}
                    onClick={() => onBillingCycleChange(cycle)}
                    className={`!rounded-xl !px-4 !py-2 !text-xs !font-extrabold !normal-case ${billingCycle === cycle ? "!bg-[var(--theme-accent)] !text-white" : "!text-[var(--theme-copy)]"}`}
                    key={cycle}
                >
                    {cycle} billing
                </Button>
            ))}
        </div>
    </section>
);

export default PricingHero;
import Button from "@mui/material/Button";
