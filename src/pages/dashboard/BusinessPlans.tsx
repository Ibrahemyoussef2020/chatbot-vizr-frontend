import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import getErrorText from "@/utils/typeErrorText";
import { deletePlan, listPlans, savePlan, type BusinessPlan, type PlanInput } from "@/services/core/businessPlans";
import PlanForm from "@/components/plans/PlanForm";
import CrudActionButton from "@/components/shared/CrudActionButton";
import PlanFeatureGroups from "@/components/plans/PlanFeatureGroups";
import { getFeatureOptions, listFeatures, type BusinessFeature, type FeatureOptions } from "@/services/core/businessFeatures";

const BusinessPlans = () => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("plans.manage") === true);
    const [plans, setPlans] = useState<BusinessPlan[]>([]);
    const [catalog, setCatalog] = useState<BusinessFeature[]>([]);
    const [featureOptions, setFeatureOptions] = useState<FeatureOptions>({ metrics: [], agents: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editor, setEditor] = useState<BusinessPlan | null | undefined>(undefined);
    const [pendingDelete, setPendingDelete] = useState<BusinessPlan | null>(null);
    const [busy, setBusy] = useState(false);
    const [yearly, setYearly] = useState(false);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const [data, features, options] = await Promise.all([listPlans(controller.signal), listFeatures(controller.signal), getFeatureOptions(controller.signal)]);
                if (!controller.signal.aborted) { setPlans(data); setCatalog(features); setFeatureOptions(options); }
            } catch (failure) {
                if (!controller.signal.aborted) setError(getErrorText(failure));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        void load();
        return () => controller.abort();
    }, [allowed, reload]);

    const submit = async (input: PlanInput) => {
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            const saved = await savePlan(input, editor?._id);
            setPlans(current => [...current.filter(plan => plan._id !== saved._id), saved]
                .sort((a, b) => a.sortOrder - b.sortOrder));
            setEditor(undefined);
            setSuccess("Plan saved.");
        } catch (failure) {
            setError(getErrorText(failure));
        } finally {
            setBusy(false);
        }
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setBusy(true);
        setError("");
        setSuccess("");
        try {
            await deletePlan(pendingDelete._id);
            setPlans(current => current.filter(plan => plan._id !== pendingDelete._id));
            setPendingDelete(null);
            setSuccess("Plan deleted.");
        } catch (failure) {
            setError(getErrorText(failure));
        } finally {
            setBusy(false);
        }
    };

    if (!allowed) return <Alert severity="warning">You need the Control Plans permission to manage business pricing.</Alert>;

    return (
        <div className="mx-auto w-full max-w-[1400px] space-y-3 px-2 pb-2 pt-0">
            <header className="pricing-page-header flex flex-wrap items-center justify-between gap-3 border-b border-border">
                <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Business Owner</span>
                    <h1 className="mt-1 mb-2 text-3xl font-extrabold text-foreground">Pricings</h1>
                    <p className="text-sm leading-6 text-muted-foreground">Manage business subscription plans and pricing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="contained" disabled={loading || busy} onClick={() => {
                        setError("");
                        setSuccess("");
                        setEditor(null);
                    }}>Add plan</Button>
                </div>
            </header>
            {error && editor === undefined && !pendingDelete && <Alert severity="error" action={<Button onClick={() => setReload(value => value + 1)}>Retry</Button>}>{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <div className="flex flex-col items-center gap-2 mt-4 sm:mt-7">
                <div className="inline-flex rounded-full border border-border bg-surface-muted p-0.5" role="group" aria-label="Billing cycle">
                    {([false, true] as const).map(isYearly => (
                        <button key={String(isYearly)} type="button" aria-pressed={yearly === isYearly}
                            onClick={() => setYearly(isYearly)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${yearly === isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                            {isYearly ? "Yearly" : "Monthly"}
                        </button>
                    ))}
                </div>
                <p className="h-4 text-xs font-semibold text-primary" aria-live="polite">{yearly ? "Save 25% with yearly billing" : ""}</p>
            </div>
            {loading ? <CircularProgress aria-label="Loading plans" /> : (
                <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map(plan => {
                        const amount = yearly ? plan.pricing.yearly : plan.pricing.monthly;
                        return (
                            <article key={plan._id} className="flex h-full flex-col rounded-xl border border-border bg-card p-5 text-foreground">
                                <h2 className="text-xl font-bold">{plan.name}{plan.popular ? " · Popular" : ""}</h2>
                                <p className="text-sm text-muted-foreground">{plan.code} · {plan.status} · {plan.visibility}</p>
                                <p className="my-4 text-2xl font-bold">{amount === null ? "Contact for pricing" : `${plan.currency} ${amount} / ${yearly ? "year" : "month"}`}</p>
                                <p className="mb-3 text-sm">{plan.description}</p>
                                <div className="mb-4">
                                    {plan.featureIds?.length ? <PlanFeatureGroups bundles={plan.featureIds.flatMap(id => {
                                        const bundle = catalog.find(feature => feature._id === id);
                                        return bundle ? [bundle] : [];
                                    })} options={featureOptions} /> : <>
                                    <ul className="mb-2 list-inside list-disc text-sm">
                                        {plan.features.map((feature, index) => <li key={index}>{feature}</li>)}
                                    </ul>
                                    <PlanFeatureGroups bundles={[{ _id: `unselected-${plan._id}`, code: "", name: "Feature bundle not selected", description: "", quotas: {}, agentSlugs: [] }]} options={featureOptions} />
                                    </>}
                                </div>
                                <div className="mt-auto flex gap-1">
                                <CrudActionButton action="edit" label={`Edit ${plan.name}`} onClick={() => {
                                    setError("");
                                    setEditor(plan);
                                }} />
                                <CrudActionButton action="delete" label={`Delete ${plan.name}`} onClick={() => {
                                    setError("");
                                    setPendingDelete(plan);
                                }} />
                                </div>
                            </article>
                        );
                    })}
                    {!plans.length && !error && <p>No plans yet. Add your first pricing plan.</p>}
                </div>
            )}
            {editor !== undefined && <PlanForm plan={editor} busy={busy} error={error} onSave={submit} onClose={() => setEditor(undefined)} />}
            <Dialog open={Boolean(pendingDelete)} onClose={() => { if (!busy) setPendingDelete(null); }}>
                <DialogTitle>Delete {pendingDelete?.name}?</DialogTitle>
                <DialogContent>
                    <p>This permanently removes the plan. Plans with subscriptions or payments must be archived instead.</p>
                    {error && <Alert severity="error">{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button disabled={busy} onClick={() => setPendingDelete(null)}>Cancel</Button>
                    <CrudActionButton action="delete" label={busy ? "Deleting plan" : `Confirm deletion of ${pendingDelete?.name || "plan"}`} busy={busy} onClick={() => void confirmDelete()} />
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BusinessPlans;
