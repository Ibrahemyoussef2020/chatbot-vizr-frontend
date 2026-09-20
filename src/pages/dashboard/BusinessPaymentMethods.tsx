import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import CrudActionButton from "@/components/shared/CrudActionButton";
import { useAppSelector } from "@/redux/store";
import getErrorText from "@/utils/typeErrorText";
import { listPaymentMethods, type PaymentMethod } from "@/services/payments/methods";

const BusinessPaymentMethods = () => {
    const allowed = useAppSelector(state => state.auth.user?.role === "super_admin");
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await listPaymentMethods(controller.signal);
                if (!controller.signal.aborted) setMethods(result);
            } catch (failure) {
                if (!controller.signal.aborted) setError(getErrorText(failure));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        void load();
        return () => controller.abort();
    }, [allowed, retry]);

    if (!allowed) {
        return <Alert severity="warning">Only the platform owner can manage global payment methods.</Alert>;
    }

    return (
        <div className="mx-auto max-w-[1400px] space-y-6 p-2">
            <header>
                <p className="m-0 text-xs font-bold uppercase tracking-widest text-primary">Platform payment settings</p>
                <h1 className="mt-1 text-3xl font-extrabold text-foreground">Payment Methods</h1>
                <p className="mt-2 text-sm text-muted-foreground">These payment methods are shared by every workspace. Stripe credentials can use server environment values as a fallback.</p>
            </header>
            {error && (
                <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Retry</Button>}>{error}</Alert>
            )}
            {loading ? <CircularProgress aria-label="Loading payment methods" /> : !error && (
                <div className="grid gap-4 md:grid-cols-2">
                    {methods.map(method => (
                        <article key={method.provider} className="space-y-3 rounded-xl border border-border bg-card p-5 text-foreground">
                            <h2 className="text-xl font-bold">{method.label}</h2>
                            <p>{method.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {method.isEnabled ? "Enabled" : "Disabled"} · {method.isTestMode ? "Test mode" : "Live mode"} · {method.supportedCurrencies.join(", ")}
                            </p>
                            {method.provider === "stripe" && <p className="text-xs text-muted-foreground">{method.credentialFields.map(field => `${field.label}: ${method.credentialStatus[field.key] === "workspace" ? "workspace override" : method.credentialStatus[field.key] === "environment" ? "server environment" : method.credentialStatus[field.key] === "global" ? "shared legacy setting" : "not configured"}`).join(" · ")}</p>}
                            <CrudActionButton action="edit" label={`Configure ${method.label}`} to={`/dashboard/business/payment-methods/${method.provider}/edit`} />
                        </article>
                    ))}
                    {!methods.length && <p className="text-muted-foreground">No payment methods are available.</p>}
                </div>
            )}
        </div>
    );
};

export default BusinessPaymentMethods;
