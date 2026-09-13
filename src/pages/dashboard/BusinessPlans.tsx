import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import getErrorText from "@/utils/typeErrorText";
import { deletePlan, listPlans, savePlan, type BusinessPlan, type PlanInput } from "@/services/core/businessPlans";
import PlanForm from "@/components/plans/PlanForm";

const BusinessPlans = () => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("plans.manage") === true);
    const [plans, setPlans] = useState<BusinessPlan[]>([]);
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
                const data = await listPlans(controller.signal);
                if (!controller.signal.aborted) setPlans(data);
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
        <div className="mx-auto w-full max-w-[1400px] space-y-6 p-2">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-primary">Business Owner</span>
                    <h1 className="mt-1 text-3xl font-extrabold text-foreground">Pricings</h1>
                    <p className="text-sm text-muted-foreground">Manage business subscription plans and pricing.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setYearly(value => !value)}>{yearly ? "Yearly" : "Monthly"}</Button>
                    <Button variant="contained" onClick={() => { setError(""); setEditor(null); }}>Add plan</Button>
                </div>
            </header>
            {error && editor === undefined && !pendingDelete && <Alert severity="error" action={<Button onClick={() => setReload(value => value + 1)}>Retry</Button>}>{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            {loading ? <CircularProgress aria-label="Loading plans" /> : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {plans.map(plan => {
                        const amount = yearly ? plan.pricing.yearly : plan.pricing.monthly;
                        return (
                            <article key={plan._id} className="rounded-xl border border-border bg-card p-5 text-foreground">
                                <h2 className="text-xl font-bold">{plan.name}{plan.popular ? " · Popular" : ""}</h2>
                                <p className="text-sm text-muted-foreground">{plan.code} · {plan.status} · {plan.visibility}</p>
                                <p className="my-4 text-2xl font-bold">{amount === null ? "Contact for pricing" : `${plan.currency} ${amount} / ${yearly ? "year" : "month"}`}</p>
                                <p className="mb-3 text-sm">{plan.description}</p>
                                <ul className="mb-4 list-inside list-disc text-sm">
                                    {plan.features.map((feature, index) => <li key={index}>{feature}</li>)}
                                </ul>
                                <Button onClick={() => { setError(""); setEditor(plan); }}>Edit</Button>
                                <Button color="error" onClick={() => { setError(""); setPendingDelete(plan); }}>Delete</Button>
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
                    <Button disabled={busy} color="error" onClick={() => void confirmDelete()}>{busy ? "Deleting…" : "Delete plan"}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default BusinessPlans;
