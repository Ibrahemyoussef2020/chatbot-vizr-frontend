import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/redux";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import { workspaceServices } from "@/services";
import { startFreePlan, subscribeToPlan } from "@/services/payments/checkout";
import type { PlanItem } from "@/services/core/landing";
import { useLandingPage } from "@/hooks/useLandingPage";
import getErrorText from "@/utils/typeErrorText";

const Onboarding = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const workspace = useAppSelector((state) => state.workspace.active);
    const workspacesLoading = useAppSelector((state) => state.workspace.loading);
    const { page, error, loading } = useLandingPage("pricing");
    const [plan, setPlan] = useState<PlanItem | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [submitting, setSubmitting] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [paymentNote, setPaymentNote] = useState("");
    const plans = (page?.sections.find((section) => section.type === "plans")?.items || []) as PlanItem[];

    useEffect(() => {
        dispatch(fetchWorkspaces());
    }, [dispatch]);

    useEffect(() => {
        const savedPlan = plans.find((item) => item.code === workspace?.selected_plan_code);
        if (savedPlan) setPlan(savedPlan);
    }, [plans, workspace?.selected_plan_code]);

    if (!user) return <Navigate to="/auth/login" replace />;

    const continueToWorkspace = () => {
        if (!plan) {
            toast.error("Choose a plan to continue.");
            return;
        }
        const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
        if (price === null) {
            toast.error("This plan has no price for the selected billing cycle. Choose another cycle or contact sales.");
            return;
        }
        setStep(2);
    };

    const submitWorkspace = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!workspace || !plan) {
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

        setSubmitting(true);
        setPaymentNote("");
        try {
            await workspaceServices.updateWorkspace(workspace.slug, profile);
            await dispatch(fetchWorkspaces()).unwrap();

            const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            if (price === 0) {
                await startFreePlan(plan.code, billingCycle);
                toast.success("Workspace setup complete.");
                navigate("/dashboard", { replace: true });
                return;
            }

            const checkout = await subscribeToPlan({
                planCode: plan.code,
                provider: "stripe",
                billingCycle,
                email: user.email,
                name: user.name,
            }, true);

            if (checkout.checkout.mode === "redirect" && checkout.checkout.checkoutUrl) {
                window.location.assign(checkout.checkout.checkoutUrl);
                return;
            }

            setPaymentNote(checkout.checkout.instructions || "Your payment request was sent for review.");
            toast.success("Workspace saved. Payment is awaiting review.");
        } catch (reason) {
            toast.error(getErrorText(reason));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 text-foreground sm:py-16">
            <div className="mx-auto mb-8 max-w-2xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Set up your account · Step {step} of 2</p>
                <h1 className="mb-3 mt-3 text-3xl font-extrabold sm:text-4xl">{step === 1 ? "Choose a plan" : "Set up your workspace"}</h1>
                <p className="m-0 text-sm leading-6 text-muted-foreground">
                    {step === 1 ? "Pick the plan that fits your business. You can review billing before checkout." : "Tell us about your business so we can prepare your workspace."}
                </p>
            </div>

            {(loading || workspacesLoading || !workspace) && <p className="py-12 text-center text-muted-foreground">Loading your setup...</p>}
            {error && <p className="py-12 text-center text-error">{error}</p>}

            {!loading && !workspacesLoading && workspace && !error && step === 1 && (
                <>
                    <div className="mb-5 flex justify-center gap-2">
                        {(["monthly", "yearly"] as const).map((cycle) => (
                            <Button key={cycle} variant={billingCycle === cycle ? "contained" : "outlined"} onClick={() => setBillingCycle(cycle)} className="!normal-case">{cycle} billing</Button>
                        ))}
                    </div>
                    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((item) => {
                            const price = billingCycle === "yearly" ? item.yearlyPrice : item.monthlyPrice;
                            return (
                                <button key={item.code} type="button" onClick={() => setPlan(item)} className={`rounded-2xl border p-5 text-left transition ${plan?.code === item.code ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/60"}`} aria-pressed={plan?.code === item.code}>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.eyebrow || (item.popular ? "Most popular" : "Plan")}</span>
                                    <h2 className="mb-2 mt-2 text-xl font-bold">{item.name}</h2>
                                    <p className="min-h-12 text-sm text-muted-foreground">{item.description}</p>
                                    <p className="mb-0 mt-4 text-2xl font-extrabold">{price === null ? "Custom" : price === 0 ? "Free" : `${item.currency} ${price}`}<span className="text-sm font-medium text-muted-foreground">{price && price > 0 ? billingCycle === "yearly" ? "/year" : "/month" : ""}</span></p>
                                    <ul className="mt-4 grid gap-2 pl-5 text-sm">{item.features.slice(0, 4).map((feature) => <li key={feature}>{feature}</li>)}</ul>
                                </button>
                            );
                        })}
                    </section>
                    <div className="mt-8 flex justify-center"><Button variant="contained" disabled={!plan} onClick={continueToWorkspace} className="!px-8 !py-3 !normal-case">Continue</Button></div>
                </>
            )}

            {!loading && !workspacesLoading && workspace && step === 2 && plan && (
                <form onSubmit={submitWorkspace} className="workspace-onboarding-form mx-auto grid max-w-2xl gap-5 rounded-2xl border border-border bg-surface p-5 text-foreground sm:p-8">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div><p className="m-0 text-xs font-bold uppercase tracking-wider text-primary">Selected plan</p><p className="mb-0 mt-1 font-bold">{plan.name} · {billingCycle}</p></div>
                        <Button onClick={() => setStep(1)} className="!normal-case">Change</Button>
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
                        {(billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) !== 0 && <p className="col-span-full m-0 text-sm text-muted-foreground">Secure checkout is handled by Stripe after you save the workspace.</p>}
                    </div>
                    {paymentNote && <div className="whitespace-pre-line rounded-xl bg-primary/10 p-4 text-sm leading-6 text-foreground">{paymentNote}<p className="mb-0 mt-3"><Link className="font-bold text-primary" to="/dashboard">Continue to dashboard</Link></p></div>}
                    <div className="flex justify-end"><Button type="submit" variant="contained" disabled={submitting} className="!px-6 !py-3 !normal-case">{submitting ? "Saving..." : (billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) === 0 ? "Finish setup" : "Save workspace and continue to payment"}</Button></div>
                </form>
            )}
        </main>
    );
};

export default Onboarding;
