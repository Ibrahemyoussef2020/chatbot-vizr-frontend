import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import { workspaceServices } from "@/services";
import { getCheckoutPaymentMethods, startFreePlan, subscribeToPlan, type CheckoutPaymentMethod } from "@/services/payments/checkout";
import type { PlanItem } from "@/services/core/landing";
import { useLandingPage } from "@/hooks/useLandingPage";
import getErrorText from "@/utils/typeErrorText";

const Onboarding = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAppSelector((state) => state.auth);
    const workspace = useAppSelector((state) => state.workspace.active);
    const workspacesLoading = useAppSelector((state) => state.workspace.loading);
    const { page, error, loading } = useLandingPage("pricing");
    const [pickedPlanCode, setPickedPlanCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(() =>
        searchParams.get("cycle") === "yearly" || sessionStorage.getItem("onboarding_billing_cycle") === "yearly" ? "yearly" : "monthly",
    );
    const [paymentMethods, setPaymentMethods] = useState<CheckoutPaymentMethod[]>([]);
    const workspacePage = location.pathname.endsWith("/workspace");
    const selectedPlanCode = searchParams.get("plan");
    const plans = useMemo(() => (page?.sections.find((section) => section.type === "plans")?.items || []) as PlanItem[], [page?.sections]);
    const effectivePlanCode = selectedPlanCode || pickedPlanCode || sessionStorage.getItem("onboarding_plan_code") || workspace?.selected_plan_code || "";
    const plan = plans.find(item => item.code === effectivePlanCode) || null;

    useEffect(() => {
        dispatch(fetchWorkspaces());
    }, [dispatch]);

    useEffect(() => {
        const controller = new AbortController();
        getCheckoutPaymentMethods(controller.signal).then(setPaymentMethods).catch(() => undefined);
        return () => controller.abort();
    }, []);

    if (!user) return <Navigate to="/auth/login" replace />;
    if (workspacePage && !loading && !error && !plans.some((item) => item.code === (selectedPlanCode || sessionStorage.getItem("onboarding_plan_code") || workspace?.selected_plan_code))) {
        return <Navigate to="/onboarding" replace />;
    }
    if (workspacePage && plan && (billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) !== 0
        && !["stripe", "vodafone_cash"].includes(sessionStorage.getItem("onboarding_payment_provider") || "")) {
        return <Navigate to={`/onboarding/payment?plan=${encodeURIComponent(plan.code)}&cycle=${billingCycle}`} replace />;
    }

    const continueToPayment = () => {
        if (!plan) {
            toast.error("Choose a plan to continue.");
            return;
        }
        const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
        if (price === null) {
            toast.error("This plan has no price for the selected billing cycle. Choose another cycle or contact sales.");
            return;
        }
        sessionStorage.setItem("onboarding_plan_code", plan.code);
        sessionStorage.setItem("onboarding_billing_cycle", billingCycle);
        navigate(price === 0
            ? `/onboarding/workspace?plan=${encodeURIComponent(plan.code)}&cycle=${billingCycle}`
            : `/onboarding/payment?plan=${encodeURIComponent(plan.code)}&cycle=${billingCycle}`);
    };

    const submitWorkspace = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!plan) {
            toast.error("Your workspace is not ready yet. Refresh the page and try again.");
            return;
        }

        const form = new FormData(event.currentTarget);
        const profile = {
            name: String(form.get("name") || "").trim(),
            business_name: String(form.get("business_name") || "").trim(),
            industry: String(form.get("industry") || "").trim(),
            support_email: String(form.get("support_email") || "").trim(),
            support_phone: String(form.get("support_phone") || "").trim(),
            website_url: String(form.get("website_url") || "").trim(),
            country: String(form.get("country") || "").trim(),
            timezone: String(form.get("timezone") || "UTC").trim(),
            selected_plan_code: plan.code,
        };

        const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
        const paymentProvider = sessionStorage.getItem("onboarding_payment_provider") as "stripe" | "vodafone_cash" | null;
        const paymentMethod = paymentMethods.find(method => method.provider === paymentProvider && method.supportedCurrencies.includes(plan.currency.toUpperCase()));
        if (price !== 0 && !paymentMethod) {
            toast.error(`Your selected payment method is no longer enabled for ${plan.currency}. Choose another payment method.`);
            navigate(`/onboarding/payment?plan=${encodeURIComponent(plan.code)}&cycle=${billingCycle}`);
            return;
        }

        setSubmitting(true);
        try {
            const targetWorkspace = workspace
                ? await workspaceServices.updateWorkspace(workspace.slug, profile)
                : await workspaceServices.createWorkspace(profile);
            await dispatch(fetchWorkspaces({ force: true })).unwrap();

            if (price === 0) {
                await startFreePlan(plan.code, billingCycle);
                toast.success("Workspace setup complete.");
                navigate("/dashboard", { replace: true });
                return;
            }

            const checkout = await subscribeToPlan({
                planCode: plan.code,
                provider: paymentProvider!,
                billingCycle,
                email: user.email,
                name: user.name,
                payerFields: paymentMethod?.mode === "manual"
                    ? JSON.parse(sessionStorage.getItem("onboarding_payer_fields") || "{}") as Record<string, string>
                    : undefined,
                system_slug: targetWorkspace.slug,
            }, true);

            if (checkout.checkout.mode === "redirect" && checkout.checkout.checkoutUrl) {
                window.location.assign(checkout.checkout.checkoutUrl);
                return;
            }

            sessionStorage.setItem("onboarding_payment_instructions", checkout.checkout.instructions || "Your payment details were submitted for review.");
            sessionStorage.setItem("onboarding_payment_reference", checkout.checkout.reference);
            navigate("/payment/pending-review", { replace: true });
        } catch (reason) {
            toast.error(getErrorText(reason));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 text-foreground sm:py-16">
            <div className="mb-8 flex items-center justify-between">
                <Link to="/" aria-label="Vizr home" className="inline-flex items-center gap-2 no-underline">
                    <img src="/robot.png" alt="" className="h-10 w-10 object-contain" />
                    <span className="text-xl font-black text-foreground">Vizr <span className="text-primary">AI</span></span>
                </Link>
                {workspacePage && (
                    <Button onClick={() => navigate(`/onboarding/payment?plan=${encodeURIComponent(plan?.code || selectedPlanCode || "")}&cycle=${billingCycle}`)} className="!normal-case">
                        <span aria-hidden="true" className="mr-2">←</span>
                        Back to payment
                    </Button>
                )}
            </div>
            <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Set up your account · Step {workspacePage ? 3 : 1} of 3</p>
                <h1 className="mb-3 mt-3 text-3xl font-extrabold sm:text-4xl">{workspacePage ? "Set up your workspace" : "Choose a plan"}</h1>
                <p className="m-0 text-sm leading-6 text-muted-foreground">
                    {workspacePage ? "Tell us about your business so we can prepare your workspace." : "Pick the plan that fits your business. You can review billing before checkout."}
                </p>
            </div>

            {(loading || (workspacePage && workspacesLoading)) && <p className="py-12 text-center text-muted-foreground">Loading your setup...</p>}
            {error && <p className="py-12 text-center text-error">{error}</p>}

            {!workspacePage && !loading && !error && (
                <>
                    <div className="mb-5 flex justify-center gap-2">
                        {(["monthly", "yearly"] as const).map((cycle) => (
                            <Button key={cycle} variant={billingCycle === cycle ? "contained" : "outlined"} onClick={() => { setBillingCycle(cycle); sessionStorage.setItem("onboarding_billing_cycle", cycle); }} className="!normal-case">{cycle} billing</Button>
                        ))}
                    </div>
                    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Choose a plan">
                        {plans.map((item) => {
                            const price = billingCycle === "yearly" ? item.yearlyPrice : item.monthlyPrice;
                            const isSelected = plan?.code === item.code;
                            return (
                                <button key={item.code} type="button" onClick={() => { setPickedPlanCode(item.code); sessionStorage.setItem("onboarding_plan_code", item.code); }} className={`rounded-2xl p-5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isSelected ? "border-2 border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border border-border bg-surface hover:border-primary/60"}`} role="radio" aria-checked={isSelected}>
                                    <span className="flex items-start justify-between gap-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.eyebrow || (item.popular ? "Most popular" : "Plan")}</span>
                                        <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-primary" : "border-muted-foreground"}`}>
                                            {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                        </span>
                                    </span>
                                    <h2 className="mb-2 mt-2 text-xl font-bold">{item.name}</h2>
                                    <p className="min-h-12 text-sm text-muted-foreground">{item.description}</p>
                                    <p className="mb-0 mt-4 text-2xl font-extrabold">{price === null ? "Custom" : price === 0 ? "Free" : `${item.currency} ${price}`}<span className="text-sm font-medium text-muted-foreground">{price && price > 0 ? billingCycle === "yearly" ? "/year" : "/month" : ""}</span></p>
                                    <ul className="mt-4 grid gap-2 pl-5 text-sm">{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                                    {item.featureBundles?.map(bundle => <div key={bundle.name} className="mt-4 border-t border-border pt-4">
                                        <p className="mb-1 font-semibold">{bundle.name}</p>
                                        {bundle.description && <p className="mb-2 text-xs text-muted-foreground">{bundle.description}</p>}
                                        <ul className="grid gap-1 pl-5 text-xs text-muted-foreground">
                                            {(item.featureOptions?.metrics || []).map(metric => {
                                                const value = bundle.quotas[metric.key];
                                                const included = value !== undefined && value !== 0;
                                                const unit = metric.unit === "megabytes" ? "MB" : metric.unit;
                                                const period = { per_second: "/ second", per_day: "/ day", per_month: "/ month", total: "" }[metric.window] || "";
                                                const allowance = value === undefined || value === 0 ? "Not included" : value === -1 ? "Unlimited" : `${value.toLocaleString()} ${unit}${period ? ` ${period}` : ""}`;
                                                return <li key={metric.key}><span aria-hidden="true" className={included ? "text-emerald-500" : "text-muted-foreground"}>{included ? "✓" : "×"}</span> {metric.label}: {allowance}</li>;
                                            })}
                                            {(item.featureOptions?.agents || []).map(agent => { const included = bundle.agentSlugs.includes(agent.slug); return <li key={agent.slug}><span aria-hidden="true" className={included ? "text-emerald-500" : "text-muted-foreground"}>{included ? "✓" : "×"}</span> {agent.name}: {included ? "Included" : "Not included"}</li>; })}
                                        </ul>
                                    </div>)}
                                    {!item.featureBundles?.length && item.featureOptions?.metrics?.length ? <div className="mt-4 border-t border-border pt-4">
                                        <p className="mb-1 font-semibold">Usage limits</p>
                                        <ul className="grid gap-1 pl-5 text-xs text-muted-foreground">
                                            {item.featureOptions.metrics.map(metric => {
                                                const value = item.quotas?.[metric.key];
                                                const included = value !== undefined && value !== 0;
                                                const unit = metric.unit === "megabytes" ? "MB" : metric.unit;
                                                const period = { per_second: "/ second", per_day: "/ day", per_month: "/ month", total: "" }[metric.window] || "";
                                                const allowance = value === undefined || value === 0 ? "Not included" : value === -1 ? "Unlimited" : `${value.toLocaleString()} ${unit}${period ? ` ${period}` : ""}`;
                                                return <li key={metric.key}><span aria-hidden="true" className={included ? "text-emerald-500" : "text-muted-foreground"}>{included ? "✓" : "×"}</span> {metric.label}: {allowance}</li>;
                                            })}
                                            {(item.featureOptions.agents || []).map(agent => <li key={agent.slug}><span aria-hidden="true" className="text-muted-foreground">×</span> {agent.name}: Not included</li>)}
                                        </ul>
                                    </div> : null}
                                    {item.featureOptions?.entitlements?.length ? <div className="mt-4 border-t border-border pt-4">
                                        <p className="mb-1 font-semibold">Plan features</p>
                                        <ul className="grid gap-1 pl-5 text-xs text-muted-foreground">
                                            {item.featureOptions.entitlements.map(entitlement => { const included = Boolean(item.entitlements?.[entitlement.key]); return <li key={entitlement.key}><span aria-hidden="true" className={included ? "text-emerald-500" : "text-muted-foreground"}>{included ? "✓" : "×"}</span> {entitlement.label}</li>; })}
                                        </ul>
                                    </div> : null}
                                </button>
                            );
                        })}
                    </section>
                    <div className="mt-8 flex justify-center"><Button variant="contained" disabled={!plan} onClick={continueToPayment} className="!px-8 !py-3 !normal-case">Continue to payment</Button></div>
                </>
            )}

            {workspacePage && !loading && !workspacesLoading && !plan && !error && <p className="py-12 text-center text-muted-foreground">Loading the selected plan...</p>}

            {workspacePage && !loading && !workspacesLoading && plan && !error && (
                <form onSubmit={submitWorkspace} className="workspace-onboarding-form mx-auto grid max-w-2xl gap-5 rounded-2xl border border-border bg-surface p-5 text-foreground sm:p-8">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div><p className="m-0 text-xs font-bold uppercase tracking-wider text-primary">Selected plan</p><p className="mb-0 mt-1 font-bold">{plan.name} · {billingCycle}</p></div>
                        <Button onClick={() => navigate(`/onboarding/payment?plan=${encodeURIComponent(plan.code)}&cycle=${billingCycle}`)} className="!normal-case">Change payment</Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField name="name" label="Workspace name" required defaultValue={workspace?.name || ""} slotProps={{ htmlInput: { maxLength: 255 } }} />
                        <TextField name="business_name" label="Business name" required defaultValue={workspace?.business_name || ""} slotProps={{ htmlInput: { maxLength: 255 } }} />
                        <TextField name="industry" label="Industry" required defaultValue={workspace?.industry || ""} slotProps={{ htmlInput: { maxLength: 120 } }} />
                        <TextField name="support_email" label="Business email" type="email" required defaultValue={workspace?.support_email || user.email} />
                        <TextField name="support_phone" label="Phone" defaultValue={workspace?.support_phone || ""} />
                        <TextField name="website_url" label="Website" placeholder="https://example.com" defaultValue={workspace?.website_url || ""} />
                        <TextField name="country" label="Country" defaultValue={workspace?.country || ""} />
                        <TextField name="timezone" label="Timezone" defaultValue={workspace?.timezone || "Africa/Cairo"} />
                    </div>
                    <div className="flex justify-end"><Button type="submit" variant="contained" disabled={submitting} className="!px-6 !py-3 !normal-case">{submitting ? "Creating workspace..." : (billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) === 0 ? "Finish setup" : "Create workspace and submit payment"}</Button></div>
                </form>
            )}
        </main>
    );
};

export default Onboarding;
