import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, CircularProgress, FormControlLabel, TextField } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import CrudActionButton from "@/components/shared/CrudActionButton";
import { useAppSelector } from "@/redux/store";
import getErrorText from "@/utils/typeErrorText";
import { listPaymentMethods, savePaymentMethod, type PaymentMethod } from "@/services/payments/methods";

const listPath = "/dashboard/business/payment-methods";

const PaymentMethodEditor = ({ provider }: { provider: string }) => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("payment_methods.manage"));
    const [editor, setEditor] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const methods = await listPaymentMethods(controller.signal);
                const method = methods.find(item => item.provider === provider);
                if (!method) throw new Error("Payment method not found.");
                if (!controller.signal.aborted) {
                    setEditor({ ...method, settings: { ...method.settings } });
                }
            } catch (failure) {
                if (!controller.signal.aborted) setError(getErrorText(failure));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        void load();
        return () => controller.abort();
    }, [allowed, provider, retry]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!editor || busy) return;
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            const saved = await savePaymentMethod(editor);
            setEditor(saved);
            setSuccess("Payment method saved.");
        } catch (failure) {
            setError(getErrorText(failure));
        } finally {
            setBusy(false);
        }
    };

    if (!allowed) {
        return <Alert severity="warning">You need permission to manage business payment methods.</Alert>;
    }

    const title = provider === "vodafone_cash" ? "Vodafone Cash" : provider === "stripe" ? "Stripe" : "Payment Method";
    return (
        <div className="mx-auto w-full max-w-[1000px] space-y-6 p-2">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Payment Methods</span>
                    <h1 className="mt-1 text-3xl font-extrabold text-foreground">Configure {title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Manage payment instructions, provider settings and availability.</p>
                </div>
                <Button component={Link} to={listPath} disabled={busy}>Back to payment methods</Button>
            </header>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error" action={!editor ? (
                <Button onClick={() => setRetry(value => value + 1)}>Retry</Button>
            ) : undefined}>{error}</Alert>}
            {loading ? <CircularProgress aria-label="Loading payment method" /> : editor && (
                <form onSubmit={event => void submit(event)} className="space-y-6 rounded-xl border border-border bg-card p-5 text-foreground sm:p-8">
                    {editor.provider === "stripe" && (
                        <Alert severity="info">Stripe credentials are managed in server configuration. Enabling requires a matching test/live key and webhook signing secret.</Alert>
                    )}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField label="Display name" required disabled={busy} value={editor.label}
                            onChange={event => setEditor({ ...editor, label: event.target.value })} />
                        <TextField label="Display order" type="number" disabled={busy} required value={editor.sortOrder}
                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                            onChange={event => setEditor({ ...editor, sortOrder: Number(event.target.value) })} />
                    </div>
                    <TextField fullWidth label="Payment instructions" multiline rows={3} disabled={busy} value={editor.instructions}
                        onChange={event => setEditor({ ...editor, instructions: event.target.value })} />
                    <fieldset className="rounded-lg border border-border p-4">
                        <legend className="px-2 font-semibold">Accepted currencies</legend>
                        {editor.availableCurrencies.map(currency => (
                            <FormControlLabel key={currency} label={currency} control={
                                <Checkbox disabled={busy} checked={editor.supportedCurrencies.includes(currency)}
                                    onChange={event => setEditor({
                                        ...editor,
                                        supportedCurrencies: event.target.checked
                                            ? [...editor.supportedCurrencies, currency]
                                            : editor.supportedCurrencies.filter(value => value !== currency),
                                    })} />
                            } />
                        ))}
                    </fieldset>
                    <section className="space-y-4" aria-label="Provider settings">
                        <h2 className="text-lg font-bold">Provider settings</h2>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {editor.settingFields.map(field => field.type === "boolean" ? (
                                <FormControlLabel key={field.key} label={field.label} control={
                                    <Checkbox disabled={busy} checked={Boolean(editor.settings[field.key])}
                                        onChange={event => setEditor({
                                            ...editor,
                                            settings: { ...editor.settings, [field.key]: event.target.checked },
                                        })} />
                                } />
                            ) : (
                                <TextField key={field.key} label={field.label} disabled={busy} required={editor.isEnabled && field.required}
                                    type={field.type === "number" ? "number" : field.type === "tel" ? "tel" : "text"}
                                    value={editor.settings[field.key] ?? ""} helperText={field.helpText}
                                    slotProps={{ htmlInput: { min: field.min, max: field.max, step: "any" } }}
                                    onChange={event => {
                                        const settings = { ...editor.settings };
                                        if (event.target.value === "") {
                                            delete settings[field.key];
                                        } else {
                                            settings[field.key] = field.type === "number" ? Number(event.target.value) : event.target.value;
                                        }
                                        setEditor({ ...editor, settings });
                                    }} />
                            ))}
                        </div>
                    </section>
                    <div className="flex flex-wrap gap-x-6">
                        <FormControlLabel label="Test mode" control={
                            <Checkbox disabled={busy} checked={editor.isTestMode}
                                onChange={event => setEditor({ ...editor, isTestMode: event.target.checked })} />
                        } />
                        <FormControlLabel label="Enable payment method" control={
                            <Checkbox disabled={busy} checked={editor.isEnabled}
                                onChange={event => setEditor({ ...editor, isEnabled: event.target.checked })} />
                        } />
                    </div>
                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <Button component={Link} to={listPath} disabled={busy}>Cancel</Button>
                        <CrudActionButton action="save" label={busy ? "Saving settings" : "Save settings"} busy={busy} type="submit" />
                    </div>
                </form>
            )}
        </div>
    );
};

const BusinessPaymentMethodEdit = () => {
    const { provider = "" } = useParams();
    return <PaymentMethodEditor key={provider} provider={provider} />;
};

export default BusinessPaymentMethodEdit;
