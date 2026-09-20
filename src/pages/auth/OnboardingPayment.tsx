import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Alert, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAppSelector } from "@/redux";
import { getCheckoutPaymentMethods, type CheckoutPaymentMethod } from "@/services/payments/checkout";
import type { PlanItem } from "@/services/core/landing";
import { useLandingPage } from "@/hooks/useLandingPage";
import getErrorText from "@/utils/typeErrorText";

const OnboardingPayment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useAppSelector(state => state.auth.user);
    const { page, error, loading } = useLandingPage("pricing");
    const [methods, setMethods] = useState<CheckoutPaymentMethod[]>([]);
    const [methodsError, setMethodsError] = useState("");
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [provider, setProvider] = useState<"stripe" | "vodafone_cash">(() =>
        sessionStorage.getItem("onboarding_payment_provider") === "vodafone_cash" ? "vodafone_cash" : "stripe",
    );
    const [payerValues, setPayerValues] = useState<Record<string, string>>(() => {
        try { return JSON.parse(sessionStorage.getItem("onboarding_payer_fields") || "{}"); }
        catch { return {}; }
    });
    const plans = (page?.sections.find(section => section.type === "plans")?.items || []) as PlanItem[];
    const planCode = searchParams.get("plan") || sessionStorage.getItem("onboarding_plan_code") || "";
    const cycleParam = searchParams.get("cycle");
    const cycle = cycleParam === "yearly" ? "yearly" : cycleParam === "monthly" ? "monthly" : sessionStorage.getItem("onboarding_billing_cycle") === "yearly" ? "yearly" : "monthly";
    const plan = plans.find(item => item.code === planCode);
    const price = plan ? (cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) : null;
    const currency = plan?.currency.toUpperCase();
    const options = useMemo(() => methods.filter(method => currency && method.supportedCurrencies.includes(currency)), [methods, currency]);
    const selectedMethod = options.find(method => method.provider === provider);

    useEffect(() => {
        const controller = new AbortController();
        getCheckoutPaymentMethods(controller.signal).then(result => {
            if (controller.signal.aborted) return;
            setMethods(result);
            setProvider(current => result.some(method => method.provider === current) ? current : result[0]?.provider || "stripe");
        }).catch(reason => {
            if (reason?.code !== "ERR_CANCELED") setMethodsError(getErrorText(reason));
        }).finally(() => { if (!controller.signal.aborted) setLoadingMethods(false); });
        return () => controller.abort();
    }, []);

    if (!user) return <Navigate to="/auth/login" replace />;
    if (!planCode) return <Navigate to="/onboarding" replace />;
    if (price === 0) return <Navigate to={`/onboarding/workspace?plan=${encodeURIComponent(planCode)}&cycle=${cycle}`} replace />;

    const continueToWorkspace = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!plan || !selectedMethod) {
            toast.error(!methods.length ? "No platform payment method is enabled yet." : `No enabled payment method accepts ${currency} for this plan.`);
            return;
        }
        const payerFields = selectedMethod.mode === "manual" ? payerValues : {};
        sessionStorage.setItem("onboarding_payment_provider", provider);
        sessionStorage.setItem("onboarding_payer_fields", JSON.stringify(payerFields));
        navigate(`/onboarding/workspace?plan=${encodeURIComponent(plan.code)}&cycle=${cycle}`);
    };

    return <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-10 text-foreground sm:py-16">
        <div className="mb-8 flex items-center justify-between">
            <Link to="/" aria-label="Vizr home" className="inline-flex items-center gap-2 no-underline">
                <img src="/robot.png" alt="" className="h-10 w-10 object-contain" />
                <span className="text-xl font-black text-foreground">Vizr <span className="text-primary">AI</span></span>
            </Link>
            <Button component={Link} to={`/onboarding?plan=${encodeURIComponent(planCode)}&cycle=${cycle}`} className="!normal-case">Back to plans</Button>
        </div>
        <header className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Set up your account · Step 2 of 3</p>
            <h1 className="mb-3 mt-3 text-3xl font-extrabold sm:text-4xl">Choose payment method</h1>
            <p className="m-0 text-sm leading-6 text-muted-foreground">{plan ? `${plan.name} · ${cycle} · ${currency} ${price}` : "Loading your selected plan..."}</p>
        </header>
        {(loading || loadingMethods) && <p className="py-10 text-center text-muted-foreground">Loading payment options...</p>}
        {error && <Alert severity="error">{error}</Alert>}
        {methodsError && <Alert severity="error">{methodsError}</Alert>}
        {!loading && !error && !loadingMethods && !methodsError && !methods.length && <Alert severity="warning">No platform payment method is enabled. The platform owner must enable Stripe or Vodafone Cash in Platform → Payment Methods.</Alert>}
        {!loading && !error && !loadingMethods && !methodsError && methods.length > 0 && options.length === 0 && <Alert severity="warning">No enabled payment method accepts {currency} for this plan. Enable USD for Stripe in Platform → Payment Methods, or choose a plan priced in a supported currency.</Alert>}
        {!loading && !error && !loadingMethods && !methodsError && options.length > 0 && <form onSubmit={continueToWorkspace} className="mx-auto grid max-w-2xl gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-8">
            <section>
                <h2 className="mb-1 text-lg font-bold">Payment method</h2>
                <p className="m-0 text-sm text-muted-foreground">Select how you want to pay before setting up your workspace.</p>
                <RadioGroup className="mt-3" value={provider} onChange={event => {
                    const next = event.target.value as "stripe" | "vodafone_cash";
                    setProvider(next);
                    sessionStorage.setItem("onboarding_payment_provider", next);
                }}>
                    {options.map(method => <FormControlLabel key={method.provider} value={method.provider} control={<Radio />} label={<span><strong>{method.label}</strong><br /><span className="text-sm text-muted-foreground">{method.description}</span></span>} />)}
                </RadioGroup>
            </section>
            {selectedMethod?.mode === "manual" && <section className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
                {selectedMethod.isTestMode
                    ? <Alert className="col-span-full" severity="info">Vodafone Cash test mode simulates a payment review. Do not send real money.</Alert>
                    : <Alert className="col-span-full" severity="info">Enter your transfer details. The platform team will confirm payment and activate your workspace.</Alert>}
                {selectedMethod.payerFields.map(field => <TextField key={field.key} label={field.label} type={field.type} required={field.required} placeholder={field.placeholder} helperText={field.helpText} value={payerValues[field.key] || ""} onChange={event => setPayerValues(current => ({ ...current, [field.key]: event.target.value }))} />)}
            </section>}
            {selectedMethod?.mode === "redirect" && <Alert severity="info">Stripe Checkout will open after you enter your workspace details.</Alert>}
            <div className="flex justify-end border-t border-border pt-4"><Button type="submit" variant="contained" className="!px-6 !py-3 !normal-case">Continue to workspace details</Button></div>
        </form>}
    </main>;
};

export default OnboardingPayment;
