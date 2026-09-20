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
                    setEditor({ ...method, settings: { ...method.settings }, credentials: {}, clearCredentials: [] });
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
            setEditor({ ...saved, credentials: {}, clearCredentials: [] });
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
        <div className="mx-auto w-full max-w-[1100px] space-y-6 p-2 text-foreground">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
                <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Platform · Payment settings</span>
                    <h1 className="mt-1 text-3xl font-extrabold">{title}</h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Set up this provider for every workspace. Server environment variables are used when a credential field is left blank.</p>
                </div>
                <Button component={Link} to={listPath} disabled={busy}>Back to payment methods</Button>
            </header>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error" action={!editor ? (
                <Button onClick={() => setRetry(value => value + 1)}>Retry</Button>
            ) : undefined}>{error}</Alert>}
            {loading ? <CircularProgress aria-label="Loading payment method" /> : editor && (
                <form onSubmit={event => void submit(event)} className="space-y-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                    {editor.provider === "stripe" && <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
                        <div>
                            <h2 className="m-0 text-lg font-bold">Stripe credentials</h2>
                            <p className="mb-0 mt-1 text-sm text-muted-foreground">Enter workspace-specific keys, or leave a field blank to use its server environment value. Secrets are encrypted before storage and never shown again.</p>
                            <p className="mb-0 mt-2 text-sm text-muted-foreground">Stripe webhook destination: <code className="rounded bg-surface-muted px-1.5 py-0.5">/api/webhooks/stripe</code>. Add this backend URL as a destination in this workspace’s Stripe account.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            {editor.credentialFields.map(field => {
                                const source = editor.credentialStatus[field.key] || "missing";
                                const placeholder = editor.credentials[field.key]
                                    ? "New value will replace the saved credential"
                                    : source === "workspace" ? "Saved for this workspace — leave blank to keep"
                                        : source === "environment" ? "Using server environment — enter to override for this workspace"
                                            : "Not configured";
                                return <div key={field.key} className="space-y-1">
                                    <TextField fullWidth label={field.label} type={field.secret ? "password" : "text"} disabled={busy}
                                        value={editor.credentials[field.key] || ""} placeholder={field.placeholder || placeholder}
                                        autoComplete="new-password" helperText={[field.helpText, field.environmentKey ? `Environment fallback: ${field.environmentKey}` : ""].filter(Boolean).join(" · ")}
                                        onChange={event => setEditor({ ...editor, credentials: { ...editor.credentials, [field.key]: event.target.value }, clearCredentials: editor.clearCredentials.filter(key => key !== field.key) })} />
                                    <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                                        <span>{source === "workspace" ? "Workspace value saved" : source === "environment" ? "Server environment fallback available" : source === "global" ? "Shared fallback available" : "No value configured"}</span>
                                        {source === "workspace" && <Button type="button" size="small" disabled={busy} onClick={() => setEditor({ ...editor, credentials: { ...editor.credentials, [field.key]: "" }, clearCredentials: [...new Set([...editor.clearCredentials, field.key])] })} className="!normal-case">Use server fallback</Button>}
                                    </div>
                                </div>;
                            })}
                        </div>
                    </section>}
                    <section className="space-y-4">
                    <h2 className="text-lg font-bold">Customer-facing details</h2>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField label="Display name" required disabled={busy} value={editor.label}
                            onChange={event => setEditor({ ...editor, label: event.target.value })} />
                        <TextField label="Display order" type="number" disabled={busy} required value={editor.sortOrder}
                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                            onChange={event => setEditor({ ...editor, sortOrder: Number(event.target.value) })} />
                    </div>
                    <TextField fullWidth label="Payment instructions" multiline rows={3} disabled={busy} value={editor.instructions}
                        onChange={event => setEditor({ ...editor, instructions: event.target.value })} />
                    </section>
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
                    <section className="space-y-4 rounded-xl border border-border p-5" aria-label="Provider settings">
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
