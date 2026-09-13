import { useState, type FormEvent } from "react";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, TextField } from "@mui/material";
import type { BusinessPlan, PlanInput } from "@/services/core/businessPlans";

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
    });
    const [features, setFeatures] = useState(form.features.join("\n"));
    const submit = (event: FormEvent) => {
        event.preventDefault();
        void onSave({ ...form, features: features.split("\n").map(value => value.trim()).filter(Boolean) });
    };
    return (
        <Dialog open fullWidth maxWidth="sm" onClose={() => { if (!busy) onClose(); }}>
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
                                <TextField key={cycle} label={cycle === "monthly" ? "Monthly total" : "Yearly total"}
                                    type="number" disabled={busy} value={form.pricing[cycle] ?? ""}
                                    helperText="Blank means contact for pricing." slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                                    onChange={event => setForm({ ...form, pricing: { ...form.pricing, [cycle]: event.target.value === "" ? null : Number(event.target.value) } })} />
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
                                <TextField key={field} label={field === "trialDays" ? "Trial days" : "Display order"}
                                    type="number" required disabled={busy} value={form[field]}
                                    slotProps={{ htmlInput: { min: 0, step: 1, max: field === "trialDays" ? 365 : undefined } }}
                                    onChange={event => setForm({ ...form, [field]: Number(event.target.value) })} />
                            ))}
                        </div>
                        <TextField label="Features" multiline rows={4} disabled={busy} value={features}
                            onChange={event => setFeatures(event.target.value)} helperText="One feature per line." />
                        <FormControlLabel label="Popular plan" control={
                            <Checkbox disabled={busy} checked={form.popular}
                                onChange={event => setForm({ ...form, popular: event.target.checked })} />
                        } />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button disabled={busy} onClick={onClose}>Cancel</Button>
                    <Button disabled={busy} type="submit" variant="contained">{busy ? "Saving…" : "Save plan"}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PlanForm;
