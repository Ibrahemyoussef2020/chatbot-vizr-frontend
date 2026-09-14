import { useEffect, useState, type FormEvent } from "react";
import { Alert, Autocomplete, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import CrudActionButton from "@/components/shared/CrudActionButton";
import PlanFeatureGroups from "@/components/plans/PlanFeatureGroups";

import getErrorText from "@/utils/typeErrorText";
import { deleteFeature, getFeatureOptions, listFeatures, saveFeature, type BusinessFeature, type FeatureInput, type FeatureOptions } from "@/services/core/businessFeatures";

const empty: FeatureInput = { code: "", name: "", description: "", quotas: {}, agentSlugs: [] };
const allowanceUnit = (metric?: FeatureOptions["metrics"][number]) => {
    if (!metric) return "items";
    const unit = metric.unit === "megabytes" ? "MB" : metric.unit;
    const period = { per_second: "per second", per_day: "per day", per_month: "per month", total: "at a time" }[metric.window];
    return `${unit} ${period || ""}`.trim();
};

const FeatureEditor = ({ feature, options, busy, error, onClose, onSave }: {
    feature: BusinessFeature | null; options: FeatureOptions; busy: boolean; error: string;
    onClose: () => void; onSave: (input: FeatureInput) => void;
}) => {
    const [form, setForm] = useState<FeatureInput>(feature ? {
        code: feature.code, name: feature.name, description: feature.description, quotas: { ...feature.quotas }, agentSlugs: [...feature.agentSlugs],
    } : { ...empty });

    const submit = (event: FormEvent) => { event.preventDefault(); onSave(form); };
    return <section className="plan-form-dialog rounded-xl border border-border bg-surface-elevated p-4 sm:p-6" aria-labelledby="feature-editor-title">
        <form onSubmit={submit}>
            <h2 id="feature-editor-title" className="mb-5 text-2xl font-bold">{feature ? "Edit feature" : "Add feature"}</h2>
            <div className="grid gap-4">
                {error && <Alert severity="error">{error}</Alert>}
                <TextField autoFocus label="Name" required disabled={busy} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} />
                <TextField label="Code" required disabled={busy} value={form.code} helperText="Unique code, such as ai_assistant."
                    onChange={event => setForm({ ...form, code: event.target.value })} />
                <TextField label="Description" multiline minRows={2} disabled={busy} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} />
                <Autocomplete multiple disabled={busy} options={[...new Set([...options.agents.map(agent => agent.slug), ...form.agentSlugs])]}
                    value={form.agentSlugs} getOptionLabel={slug => {
                        const agent = options.agents.find(item => item.slug === slug);
                        return agent ? `${agent.name} (${slug})` : `${slug} (unavailable)`;
                    }}
                    onChange={(_event, value) => setForm({ ...form, agentSlugs: value })}
                    renderInput={params => <TextField {...params} label="Included agents" helperText="Select agent types by their shared code." />} />
                <h3 className="font-semibold">Included usage & capacity</h3>
                <p className="text-sm text-muted-foreground">Select an allowance for each capability this feature includes.</p>
                {[...new Set(options.metrics.map(metric => metric.category))].map(category => (
                    <section key={category} className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2" aria-label={category}>
                        <h4 className="font-semibold text-primary sm:col-span-2">{category}</h4>
                        {options.metrics.filter(metric => metric.category === category).map(metric => {
                            const limit = form.quotas[metric.key];
                            const presets = metric.unit === "tokens"
                                ? [10000, 50000, 100000, 500000, 1000000, 2000000, 5000000, 10000000]
                                : metric.unit === "megabytes"
                                    ? [50, 100, 256, 512, 1024, 5120, 10240, 51200]
                                    : [1, 2, 3, 5, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 40000, 100000];
                            const amounts = [...new Set([...presets, ...(limit > 0 ? [limit] : [])])].sort((a, b) => a - b);
                            return <TextField key={metric.key} select fullWidth label={metric.label}
                                disabled={busy} value={limit ?? "unset"} helperText={metric.description}
                                onChange={event => {
                                    const quotas = { ...form.quotas };
                                    if (event.target.value === "unset") delete quotas[metric.key];
                                    else quotas[metric.key] = Number(event.target.value);
                                    setForm({ ...form, quotas });
                                }}>
                                <MenuItem value="unset">Not set by this feature</MenuItem>
                                <MenuItem value={0}>Not included</MenuItem>
                                <MenuItem value={-1}>Unlimited</MenuItem>
                                {amounts.map(amount => <MenuItem key={amount} value={amount}>{amount.toLocaleString()} {allowanceUnit(metric)}</MenuItem>)}
                            </TextField>;
                        })}
                    </section>
                ))}
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <Button disabled={busy} onClick={onClose}>Cancel</Button>
                <Button variant="contained" type="submit" disabled={busy}>{busy ? "Saving..." : "Save feature"}</Button>
            </div>
        </form>
    </section>;
};

const BusinessFeatures = () => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("plans.manage") === true);
    const [features, setFeatures] = useState<BusinessFeature[]>([]);
    const [options, setOptions] = useState<FeatureOptions>({ metrics: [], agents: [] });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [reload, setReload] = useState(0);
    const [editor, setEditor] = useState<BusinessFeature | null | undefined>();
    const [pendingDelete, setPendingDelete] = useState<BusinessFeature | null>(null);
    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        void Promise.all([listFeatures(controller.signal), getFeatureOptions(controller.signal)])
            .then(([data, choices]) => { if (!controller.signal.aborted) { setFeatures(data); setOptions(choices); setError(""); } })
            .catch(failure => { if (!controller.signal.aborted) setError(getErrorText(failure)); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [allowed, reload]);
    const submit = async (input: FeatureInput) => {
        setBusy(true); setError(""); setSuccess("");
        try {
            const saved = await saveFeature(input, editor?._id);
            setFeatures(current => [...current.filter(item => item._id !== saved._id), saved].sort((a, b) => a.name.localeCompare(b.name)));
            setEditor(undefined); setSuccess("Feature saved.");
        } catch (failure) { setError(getErrorText(failure)); }
        finally { setBusy(false); }
    };
    const remove = async () => {
        if (!pendingDelete) return;
        setBusy(true); setError(""); setSuccess("");
        try {
            await deleteFeature(pendingDelete._id);
            setFeatures(current => current.filter(item => item._id !== pendingDelete._id));
            setPendingDelete(null); setSuccess("Feature deleted.");
        } catch (failure) { setError(getErrorText(failure)); }
        finally { setBusy(false); }
    };
    if (!allowed) return <Alert severity="warning">You need the Control Plans permission to manage features.</Alert>;
    return <div className="mx-auto w-full max-w-[1400px] space-y-6 p-2">
        <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
            <div><h1 className="text-3xl font-extrabold">Pricings Features</h1><p className="text-sm text-muted-foreground">Create reusable features with quota limits and included agents.</p></div>
            <Button variant="contained" disabled={loading || busy || editor !== undefined || !!error} onClick={() => { setError(""); setSuccess(""); setPendingDelete(null); setEditor(null); }}>Add feature</Button>
        </header>
        {error && editor === undefined && !pendingDelete && <Alert severity="error" action={<Button onClick={() => { setLoading(true); setReload(value => value + 1); }}>Retry</Button>}>{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        {pendingDelete && <section className="rounded-xl border border-danger bg-surface-elevated p-4" aria-label="Confirm feature deletion">
            <h2 className="font-bold">Delete {pendingDelete.name}?</h2>
            <p className="my-2 text-sm">Features used by pricing plans must be removed from those plans first.</p>
            {error && <Alert severity="error">{error}</Alert>}
            <div className="mt-3 flex gap-2"><Button disabled={busy} onClick={() => { setPendingDelete(null); setError(""); }}>Cancel</Button><Button color="error" variant="contained" disabled={busy} onClick={() => void remove()}>{busy ? "Deleting..." : "Delete feature"}</Button></div>
        </section>}
        {loading ? <CircularProgress aria-label="Loading features" /> : editor !== undefined ? (
            <FeatureEditor key={editor?._id || "new"} feature={editor} options={options} busy={busy} error={error} onSave={input => void submit(input)} onClose={() => { setEditor(undefined); setError(""); }} />
        ) : <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map(feature => <article key={feature._id} className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
                <h2 className="text-xl font-bold">{feature.name}</h2>
                <p className="my-3 text-sm">{feature.description}</p>
                <PlanFeatureGroups bundles={[feature]} options={options} showHeading={false} />
                <div className="mt-auto flex gap-1 pt-3">
                <CrudActionButton action="edit" label={`Edit ${feature.name}`} disabled={busy} onClick={() => { setError(""); setSuccess(""); setPendingDelete(null); setEditor(feature); }} />
                <CrudActionButton action="delete" label={`Delete ${feature.name}`} disabled={busy} onClick={() => { setError(""); setPendingDelete(feature); }} />
                </div>
            </article>)}
            {!features.length && !error && <p>No features yet. Click Add feature to create your first feature.</p>}
        </div>}
    </div>;
};
export default BusinessFeatures;
