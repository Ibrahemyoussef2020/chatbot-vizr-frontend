import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import { useState } from "react";
import type { PlanItem } from "@/services/core/landing";
import { subscribeToPlan } from "@/services/core/subscription";
import type { BillingCycle } from "./types";

interface PricingGridProps {
    plans: PlanItem[];
    billingCycle: BillingCycle;
}

const getPriceLabel = (plan: PlanItem, billingCycle: BillingCycle) => {
    const yearly = billingCycle === "yearly";
    const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

    if (price == null) return { price: "Custom", period: "" };
    if (price === 0) return { price: "Free", period: "" };
    return { price: `$${price}`, period: yearly ? "/year" : "/month" };
};

const PricingCard = ({
    plan,
    billingCycle,
    onSubscribe,
    submitting,
}: {
    plan: PlanItem;
    billingCycle: BillingCycle;
    onSubscribe: (planCode: string) => void;
    submitting: boolean;
}) => {
    const price = getPriceLabel(plan, billingCycle);

    return (
        <Card
            component="article"
            variant="outlined"
            className={`!flex min-h-[650px] !flex-col !rounded-[1.8rem] !border-[var(--theme-border)] !bg-[var(--theme-surface)] !p-8 !text-[var(--theme-ink)] !shadow-none max-sm:min-h-0 max-sm:!rounded-[1.35rem] max-sm:!p-6 ${plan.popular ? "-translate-y-2 max-lg:translate-y-0" : ""}`}
        >
            <span className="text-xs font-extrabold uppercase tracking-[0.05em] text-[#19aef5]">
                {plan.eyebrow || (plan.popular ? "Most popular" : `For ${plan.name}`)}
            </span>
            <h2 className="mb-2 mt-3 text-[1.7rem] font-extrabold leading-tight">{plan.name}</h2>
            <p className="m-0 min-h-[4.4rem] border-b border-[var(--theme-border)] pb-6 text-[.84rem] leading-7 text-[var(--theme-copy)] max-sm:min-h-0">
                {plan.description}
            </p>
            <div className="mb-6 mt-6 flex items-baseline gap-2">
                <strong className="text-[2.75rem] font-extrabold leading-none">{price.price}</strong>
                <small className="font-extrabold text-[var(--theme-copy)]">{price.period}</small>
            </div>
            <Button
                variant={plan.popular ? "contained" : "outlined"}
                disabled={submitting}
                onClick={() => onSubscribe(plan.code)}
                className={`!rounded-xl !px-4 !py-3 !font-extrabold !normal-case ${plan.popular ? "!bg-[#178fd1] !text-white !shadow-[0_.65rem_1.2rem_#178fd133]" : "!border-[var(--theme-border)] !text-[var(--theme-ink)] hover:!border-[#179fe4]"}`}
            >
                {submitting ? "Processing…" : plan.ctaLabel || `Choose ${plan.name}`}
            </Button>
            <h3 className="mb-3 mt-8 text-xs font-extrabold uppercase tracking-[0.06em] text-[#19aef5]">Includes:</h3>
            <ul className="m-0 grid list-none content-start gap-3 p-0">
                {plan.features.map((feature) => (
                    <li className="flex items-start gap-3 text-[.8rem] leading-[1.45]" key={feature}>
                        <i className="font-black not-italic text-[#21c884]" aria-hidden="true">✓</i>
                        {feature}
                    </li>
                ))}
            </ul>
        </Card>
    );
};

const PricingGrid = ({ plans, billingCycle }: PricingGridProps) => {
    const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);

    const handleSubscribe = async (planCode: string) => {
        setSubmittingPlan(planCode);
        setNotification(null);

        try {
            const res = await subscribeToPlan({
                planCode,
                billingCycle,
            });

            if (res.success && res.subscription?.checkoutUrl) {
                setNotification(`Subscribed to ${res.subscription.planName} (${res.subscription.billingCycle})! Redirecting…`);
                setTimeout(() => {
                    window.location.href = res.subscription.checkoutUrl;
                }, 1000);
            }
        } catch {
            setNotification("Subscription request could not be processed. Please try again.");
        } finally {
            setSubmittingPlan(null);
        }
    };

    return (
        <div className="space-y-6">
            {notification && (
                <div className="mx-auto max-w-[1180px] rounded-xl bg-primary/10 p-4 text-center text-sm font-semibold text-primary">
                    {notification}
                </div>
            )}
            <section className="mx-auto grid max-w-[1180px] grid-cols-3 items-stretch gap-8 max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:gap-5">
                {plans.map((plan) => (
                    <PricingCard
                        plan={plan}
                        billingCycle={billingCycle}
                        key={plan.code}
                        onSubscribe={handleSubscribe}
                        submitting={submittingPlan === plan.code}
                    />
                ))}
            </section>
        </div>
    );
};

export default PricingGrid;
