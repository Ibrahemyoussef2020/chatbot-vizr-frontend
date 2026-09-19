import { useEffect, useState, type FormEvent } from "react";
import { Alert, Autocomplete, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import { getFeatureOptions, listFeatures, type BusinessFeature, type FeatureOptions } from "@/services/core/businessFeatures";
import PlanFeatureGroups from "@/components/plans/PlanFeatureGroups";
import getErrorText from "@/utils/typeErrorText";
import type { BusinessPlan, PlanInput } from "@/services/plans/plans";
import CrudActionButton from "@/components/shared/CrudActionButton";
import NumberField from "@/components/shared/NumberField";

interface Props {
    plan: BusinessPlan | null;
    busy: boolean;
    error: string;
    onSave: (input: PlanInput) => Promise<void>;
    onClose: () => void;
}

const PlanForm = ({ plan, busy, error, onSave, onClose }: Props) => {
    const [form, setForm] = useState<PlanInput>({
        code: plan?.code || "",
        name: plan?.name || "",
        description: plan?.description || "",
        currency: plan?.currency || "USD",
        pricing: plan?.pricing || { monthly: null, yearly: null },
        status: plan?.status || "draft",
        visibility: plan?.visibility || "public",
        popular: plan?.popular || false,
        trialDays: plan?.trialDays || 0,
        sortOrder: plan?.sortOrder || 0,
        features: plan?.features || [],
        featureIds: plan?.featureIds?.length ? plan.featureIds : plan?.features.length ? undefined : [],
    });
    const [catalog, setCatalog] = useState<BusinessFeature[]>([]);
    const [featureOptions, setFeatureOptions] = useState<FeatureOptions>({ metrics: [], agents: [] });
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState("");
    useEffect(() => {
        const controller = new AbortController();
        void Promise.all([listFeatures(controller.signal), getFeatureOptions(controller.signal)]).then(([data, options]) => {
            if (!controller.signal.aborted) { setCatalog(data); setFeatureOptions(options); }
        })
            .catch(failure => { if (!controller.signal.aborted) setCatalogError(getErrorText(failure)); })
            .finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
        return () => controller.abort();
    }, []);
    const submit = (event: FormEvent) => {
        event.preventDefault();
        void onSave(form);
    };
    return (
        <Dialog className="plan-form-dialog" open fullWidth maxWidth="sm" onClose={() => { if (!busy) onClose(); }}>
            <form onSubmit={submit}>
                <DialogTitle>{plan ? "Edit plan" : "Add pricing plan"}</DialogTitle>
                <DialogContent>
                    <div className="grid gap-4 pt-2">
                        {error && <Alert severity="error">{error}</Alert>}
                        {(["name", "code", "description", "currency"] as const).map(field => (
                            <TextField key={field} label={field} required={field !== "description"} disabled={busy}
                                value={form[field]} multiline={field === "description"}
                                onChange={event => setForm({ ...form, [field]: event.target.value })}
                                helperText={field === "code" ? "Unique code, such as starter or scale_pro." : undefined} />
                        ))}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {(["monthly", "yearly"] as const).map(cycle => (
                                <NumberField key={cycle} label={cycle === "monthly" ? "Monthly total" : "Yearly total"}
                                    disabled={busy} value={form.pricing[cycle] ?? ""} min={0} step={0.01}
                                    helperText="Blank means contact for pricing."
                                    onValueChange={value => setForm({ ...form, pricing: { ...form.pricing, [cycle]: value === "" ? null : Number(value) } })} />
                            ))}
                            <TextField select label="Status" disabled={busy} value={form.status}
                                onChange={event => setForm({ ...form, status: event.target.value as PlanInput["status"] })}>
                                {(["draft", "published", "archived"] as const).map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                            </TextField>
                            <TextField select label="Visibility" disabled={busy} value={form.visibility}
                                onChange={event => setForm({ ...form, visibility: event.target.value as PlanInput["visibility"] })}>
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                            </TextField>
                            {(["trialDays", "sortOrder"] as const).map(field => (
                                <NumberField key={field} label={field === "trialDays" ? "Trial days" : "Display order"}
                                    required disabled={busy} value={form[field]}
                                    min={0} step={1} max={field === "trialDays" ? 365 : undefined}
                                    onValueChange={value => setForm({ ...form, [field]: Number(value) })} />
                            ))}
                        </div>
                        <Autocomplete options={catalog} disabled={busy || catalogLoading || !!catalogError}
                            value={catalog.find(feature => feature._id === form.featureIds?.[0]) || null}
                            getOptionLabel={feature => feature.name}
                            isOptionEqualToValue={(a, b) => a._id === b._id}
                            onChange={(_event, selected) => setForm({ ...form, featureIds: selected ? [selected._id] : [], features: selected ? [selected.name] : [] })}
                            renderInput={params => <TextField {...params} label="Feature bundle" helperText={catalogLoading ? "Loading features..." : "Choose one bundle from Pricings Features."} />} />
                        {(form.featureIds?.length || 0) > 1 && <Alert severity="warning">This plan has multiple bundles. Select one bundle before saving.</Alert>}
                        {catalogError && <Alert severity="error">{catalogError}</Alert>}
                        <PlanFeatureGroups bundles={(form.featureIds || []).flatMap(id => {
                            const bundle = catalog.find(feature => feature._id === id);
                            return bundle ? [bundle] : [];
                        })} options={featureOptions} />
                        {!plan?.featureIds?.length && !!plan?.features.length && <Alert severity="info">This plan has existing display features. Select saved features to replace them.</Alert>}
                        <Button component={Link} to="/dashboard/business/pricings-features">Manage pricings features</Button>
                        <FormControlLabel label="Popular plan" control={
                            <Checkbox disabled={busy} checked={form.popular}
                                onChange={event => setForm({ ...form, popular: event.target.checked })} />
                        } />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button disabled={busy} onClick={onClose}>Cancel</Button>
                    <CrudActionButton action="save" label={busy ? "Saving plan" : "Save plan"} busy={busy} disabled={(form.featureIds?.length || 0) > 1} type="submit" />
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PlanForm;
