import { useEffect, useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import getErrorText from "@/utils/typeErrorText";
import { listPaymentMethods, savePaymentMethod, type PaymentMethod } from "@/services/core/businessPaymentMethods";

const BusinessPaymentMethods = () => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("payment_methods.manage"));
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
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

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!editor) return;
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            const saved = await savePaymentMethod(editor);
            setMethods(current => current.map(method => method.provider === saved.provider ? saved : method));
            setEditor(null);
            setSuccess("Payment method saved.");
        } catch (failure) {
            setError(getErrorText(failure));
        } finally {
            setBusy(false);
        }
    };

    if (!allowed) return <Alert severity="warning">You need permission to manage business payment methods.</Alert>;
    return (
        <div className="mx-auto max-w-[1400px] space-y-6 p-2">
            <h1 className="text-3xl font-extrabold text-foreground">Payment Methods</h1>
            {success && <Alert severity="success">{success}</Alert>}
            {error && !editor && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Retry</Button>}>{error}</Alert>}
            {loading ? <CircularProgress aria-label="Loading payment methods" /> : (
                <div className="grid gap-4 md:grid-cols-2">
                    {methods.map(method => (
                        <article key={method.provider} className="space-y-3 rounded-xl border border-border bg-card p-5 text-foreground">
                            <h2 className="text-xl font-bold">{method.label}</h2>
                            <p>{method.description}</p>
                            <p className="text-sm text-muted-foreground">{method.isEnabled ? "Enabled" : "Disabled"} · {method.isTestMode ? "Test mode" : "Live mode"} · {method.supportedCurrencies.join(", ")}</p>
                            <Button onClick={() => { setError(""); setEditor({ ...method, settings: { ...method.settings } }); }}>Configure</Button>
                        </article>
                    ))}
                </div>
            )}
            {editor && <Dialog open fullWidth maxWidth="sm" onClose={() => { if (!busy) setEditor(null); }}>
                <form onSubmit={event => void submit(event)}>
                    <DialogTitle>Configure {editor.label}</DialogTitle>
                    <DialogContent>
                        <div className="grid gap-4 pt-2">
                            {error && <Alert severity="error">{error}</Alert>}
                            {editor.provider === "stripe" && <Alert severity="info">Stripe credentials are managed in server configuration. Enabling requires a matching test/live key and webhook signing secret.</Alert>}
                            <TextField label="Display name" required disabled={busy} value={editor.label} onChange={event => setEditor({ ...editor, label: event.target.value })} />
                            <TextField label="Payment instructions" multiline rows={3} disabled={busy} value={editor.instructions} onChange={event => setEditor({ ...editor, instructions: event.target.value })} />
                            <TextField label="Display order" type="number" disabled={busy} required value={editor.sortOrder} slotProps={{ htmlInput: { min: 0, step: 1 } }} onChange={event => setEditor({ ...editor, sortOrder: Number(event.target.value) })} />
                            <fieldset className="rounded border border-border p-3">
                                <legend>Accepted currencies</legend>
                                {editor.availableCurrencies.map(currency => <FormControlLabel key={currency} label={currency} control={
                                    <Checkbox disabled={busy} checked={editor.supportedCurrencies.includes(currency)} onChange={event => setEditor({ ...editor, supportedCurrencies: event.target.checked ? [...editor.supportedCurrencies, currency] : editor.supportedCurrencies.filter(value => value !== currency) })} />
                                } />)}
                            </fieldset>
                            {editor.settingFields.map(field => field.type === "boolean" ? (
                                <FormControlLabel key={field.key} label={field.label} control={<Checkbox disabled={busy} checked={Boolean(editor.settings[field.key])} onChange={event => setEditor({ ...editor, settings: { ...editor.settings, [field.key]: event.target.checked } })} />} />
                            ) : (
                                <TextField key={field.key} label={field.label} disabled={busy} required={editor.isEnabled && field.required}
                                    type={field.type === "number" ? "number" : "text"} value={editor.settings[field.key] ?? ""} helperText={field.helpText}
                                    slotProps={{ htmlInput: { min: field.min, max: field.max, step: "any" } }}
                                    onChange={event => {
                                        const settings = { ...editor.settings };
                                        if (event.target.value === "") delete settings[field.key];
                                        else settings[field.key] = field.type === "number" ? Number(event.target.value) : event.target.value;
                                        setEditor({ ...editor, settings });
                                    }} />
                            ))}
                            <FormControlLabel label="Test mode" control={<Checkbox disabled={busy} checked={editor.isTestMode} onChange={event => setEditor({ ...editor, isTestMode: event.target.checked })} />} />
                            <FormControlLabel label="Enable payment method" control={<Checkbox disabled={busy} checked={editor.isEnabled} onChange={event => setEditor({ ...editor, isEnabled: event.target.checked })} />} />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button disabled={busy} onClick={() => setEditor(null)}>Cancel</Button>
                        <Button disabled={busy} type="submit" variant="contained">{busy ? "Saving…" : "Save settings"}</Button>
                    </DialogActions>
                </form>
            </Dialog>}
        </div>
    );
};

export default BusinessPaymentMethods;
