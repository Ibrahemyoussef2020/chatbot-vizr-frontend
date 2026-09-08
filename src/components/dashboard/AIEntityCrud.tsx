import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useState, type FormEvent, type HTMLInputTypeAttribute } from "react";
import { isAxiosError } from "axios";
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";
import * as api from "@/services/llms/aiManagement";
import { useAIManagement } from "@/features/ai-management/AIManagementContext";

type Kind = "Models" | "Agents" | "Routing" | "Quotas";
type Entity = api.AIManagementEntity;
type Props = { kind: string; items: Entity[]; providers: api.AIProviderItem[]; models: Entity[]; agents: Entity[]; workspace?: string; onChanged: () => void };
const editable = (kind: string): kind is Kind => ["Models", "Agents", "Routing", "Quotas"].includes(kind);
const canManageEntity = (kind: string, permissions: string[] = []) => permissions.includes(`ai.${kind.toLowerCase()}.manage`)
    && (kind !== "Models" || permissions.includes("business.manage"));
const idOf = (value: string | api.AIEntityReference | null | undefined): string => typeof value === "string" ? value : value?._id || value?.id || "";
const errorMessage = (error: unknown) => isAxiosError(error) ? error.response?.data?.message || "Could not save changes. Check your permissions and retry." : "Could not save changes. Please retry.";

export default function AIEntityCrud({ kind, items, providers, models, agents, workspace, onChanged }: Props) {
    const { runtime } = useAIManagement();
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState<Entity | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const canManage = canManageEntity(kind, runtime.permissions);

    const remove = async (row: Entity) => {
        if (saving || !window.confirm(`Delete ${row.name || row.displayName}?`)) return;
        setSaving(true);
        setError("");
        try {
            const id = idOf(row);
            if (kind === "Models") await api.deleteAIModel(id);
            if (kind === "Agents") await api.deleteAIAgent(id, workspace);
            if (kind === "Routing") await api.deleteAIRouting(id, workspace);
            if (kind === "Quotas") await api.deleteAIQuota(id, workspace);
            onChanged();
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail?.kind !== kind || saving || !canManage) return;
            if (detail.action === "edit") {
                setError("");
                setItem(detail.item);
                setOpen(true);
            } else if (detail.action === "delete") {
                void remove(detail.item);
            }
        };
        window.addEventListener("ai-entity-action", handler);
        return () => window.removeEventListener("ai-entity-action", handler);
    });

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        const form = new FormData(event.currentTarget);
        const raw = Object.fromEntries(form);
        const payload: Record<string, unknown> = { ...raw, enabled: raw.enabled === "on" };
        const numbers = ["priority", "contextWindow", "maxOutputTokens", "temperature", "timeoutMs", "maxRetries", "requestLimit", "tokenLimit", "concurrencyLimit"];
        for (const key of numbers) {
            if (payload[key] === "") delete payload[key];
            else if (payload[key] !== undefined) payload[key] = Number(payload[key]);
        }
        if (kind === "Agents") {
            payload.fallbackModelIds = form.getAll("fallbackModelIds").map(String);
            payload.channels = form.getAll("channels").map(String);
            payload.tools = form.getAll("tools").map(String);
        }
        if (kind === "Routing") payload.modelIds = form.getAll("modelIds").map(String);
        try {
            const id = idOf(item);
            if (kind === "Models") await (id ? api.updateAIModel(id, payload) : api.createAIModel(payload));
            if (kind === "Agents") await (id ? api.updateAIAgent(id, payload, workspace) : api.createAIAgent(payload, workspace));
            if (kind === "Routing") await (id ? api.updateAIRouting(id, payload, workspace) : api.createAIRouting(payload, workspace));
            if (kind === "Quotas") await (id ? api.updateAIQuota(id, payload, workspace) : api.createAIQuota(payload, workspace));
            setOpen(false);
            onChanged();
        } catch (failure) {
            setError(errorMessage(failure));
        } finally {
            setSaving(false);
        }
    };
    if (!editable(kind)) return null;

    return <>
        {error && !open && <Alert severity="error">{error}</Alert>}
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{items.length} {kind.toLowerCase()}</span>
            <Button size="small" variant="contained" disabled={saving || !canManage} startIcon={<HiOutlinePlus />} onClick={() => { setItem(null); setError(""); setOpen(true); }}>Create {kind.slice(0, -1)}</Button>
        </div>
        <Dialog open={open} onClose={() => { if (!saving) setOpen(false); }} fullWidth maxWidth="sm">
            <form onSubmit={save}>
                <DialogTitle>{item ? "Edit" : "Create"} {kind.slice(0, -1)}</DialogTitle>
                <DialogContent dividers className="!grid !grid-cols-2 !gap-3">
                    {error && <div className="col-span-2"><Alert severity="error">{error}</Alert></div>}
                    {kind === "Models" && <>
                        <Field name="displayName" label="Display name" value={item?.displayName} />
                        <Field name="externalId" label="External model ID" value={item?.externalId} />
                        <Select name="providerId" label="Provider" value={idOf(item?.providerId)} items={providers} />
                        <Field name="alias" label="Alias" value={item?.alias} required={false} />
                        <Field name="contextWindow" label="Context window" value={item?.contextWindow} type="number" min={1} required={false} />
                        <Field name="maxOutputTokens" label="Max output" value={item?.maxOutputTokens} type="number" min={1} required={false} />
                    </>}
                    {kind === "Agents" && <>
                        <Field name="name" label="Agent name" value={item?.name} />
                        <Field name="slug" label="Slug" value={item?.slug} />
                        <Select name="securityRoleId" label="Security role" value={idOf(item?.securityRoleId)} items={runtime.roles} />
                        <Select name="primaryModelId" label="Primary model" value={idOf(item?.primaryModelId)} items={models} />
                        {!runtime.roles.length && <p className="col-span-2 text-xs text-warning">Create a workspace role in Settings / Security before creating an agent.</p>}
                        <label className="col-span-2 grid gap-1 text-xs font-bold">System prompt<textarea required name="systemPrompt" rows={5} defaultValue={item?.systemPrompt ?? ""} className="rounded-lg border border-border bg-card p-3 text-foreground" /></label>
                        <Field name="description" label="Description" value={item?.description} required={false} />
                        <Field name="temperature" label="Temperature" value={item?.temperature ?? 0.35} type="number" min={0} max={2} step={0.01} />
                        <Field name="maxOutputTokens" label="Max output tokens" value={item?.maxOutputTokens ?? 1200} type="number" min={1} max={100000} />
                        <Field name="timeoutMs" label="Timeout (ms)" value={item?.timeoutMs ?? 45000} type="number" min={1000} max={300000} />
                        <ModelSelection name="fallbackModelIds" models={models} selected={(item?.fallbackModelIds ?? []).map(idOf)} label="Fallback models" />
                        <Checkboxes name="channels" label="Allowed channels (none selected means all)" values={["web", "whatsapp", "telegram", "instagram", "gmail"]} selected={item?.channels ?? []} />
                        <Checkboxes name="tools" label="Context capabilities (also require role permission)" values={["knowledge-search", "conversation-context"]} selected={item?.tools ?? []} />
                    </>}
                    {kind === "Routing" && <>
                        <Field name="name" label="Policy name" value={item?.name} />
                        <Select name="agentId" label="Agent" value={idOf(item?.agentId)} items={agents} />
                        <Select name="strategy" label="Strategy" value={item?.strategy ?? "priority"} values={["priority", "round_robin", "least_used", "lowest_latency", "quota_aware"]} />
                        <ModelSelection name="modelIds" models={models} selected={(item?.modelIds ?? []).map(idOf)} label="Models in fallback order" />
                        <Field name="maxRetries" label="Max fallback attempts" value={item?.maxRetries ?? 2} type="number" min={0} max={10} />
                        <Field name="timeoutMs" label="Total timeout (ms)" value={item?.timeoutMs ?? 45000} type="number" min={1000} max={300000} />
                    </>}
                    {kind === "Quotas" && <QuotaFields item={item} agents={agents} providers={providers} models={models} />}
                    <label className="col-span-2 flex items-center gap-2 text-xs font-bold"><input name="enabled" type="checkbox" defaultChecked={item?.enabled !== false} /> Enabled</label>
                </DialogContent>
                <DialogActions>
                    <Button disabled={saving} onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                </DialogActions>
            </form>
        </Dialog>
    </>;
}

function Field({ name, label, value, type = "text", required = true, ...limits }: { name: string; label: string; value?: string | number | null; type?: HTMLInputTypeAttribute; required?: boolean; min?: number; max?: number; step?: number }) {
    return <label className="grid gap-1 text-xs font-bold text-muted-foreground">{label}<input required={required} name={name} type={type} defaultValue={value ?? ""} {...limits} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground" /></label>;
}
function QuotaFields({ item, agents, providers, models }: { item: Entity | null; agents: Entity[]; providers: api.AIProviderItem[]; models: Entity[] }) {
    const [scope, setScope] = useState(item?.scope ?? "workspace");
    const targets = scope === "agent" ? agents : scope === "provider" ? providers : models;
    return <>
        <Field name="name" label="Policy name" value={item?.name} />
        <label className="grid gap-1 text-xs font-bold">Scope
            <select name="scope" value={scope} onChange={event => setScope(event.target.value)} className="rounded-lg border border-border bg-card p-2">
                {["workspace", "agent", "provider", "model"].map(value => <option key={value}>{value}</option>)}
            </select>
        </label>
        {scope !== "workspace" && <Select key={scope} name="scopeId" label="Quota target" value={idOf(item?.scopeId)} items={targets} />}
        <Select name="period" label="Period (UTC)" value={item?.period ?? "day"} values={["minute", "day", "month"]} />
        <Field name="requestLimit" label="Request limit (0 = unlimited)" value={item?.requestLimit ?? 0} type="number" min={0} />
        <Field name="tokenLimit" label="Token limit (0 = unlimited)" value={item?.tokenLimit ?? 0} type="number" min={0} />
        <Field name="concurrencyLimit" label="Concurrent requests" value={item?.concurrencyLimit ?? 1} type="number" min={1} max={10000} />
        <p className="col-span-2 text-xs text-muted-foreground">Each model attempt counts as one request. Token admission reserves a conservative input estimate plus maximum output; reported usage reconciles the reservation. Unreported or interrupted calls retain that charge until reset.</p>
    </>;
}
function Select({ name, label, value, items = [], values = [] }: { name: string; label: string; value?: string; items?: api.AIEntityReference[]; values?: string[] }) {
    return <label className="grid gap-1 text-xs font-bold text-muted-foreground">{label}<select required name={name} defaultValue={value ?? ""} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground">
        <option value="" disabled>Select...</option>
        {values.map((entry: string) => <option key={entry} value={entry}>{entry.replaceAll("_", " ")}</option>)}
        {items.map((entry: api.AIEntityReference) => <option key={idOf(entry)} value={idOf(entry)}>{entry.name || entry.displayName || entry.code}</option>)}
    </select></label>;
}
function Checkboxes({ name, label, values, selected }: { name: string; label: string; values: string[]; selected: string[] }) {
    return <fieldset className="col-span-2 grid gap-2 rounded-lg border border-border p-3">
        <legend className="text-xs font-bold">{label}</legend>
        {values.map(value => <label key={value} className="flex gap-2 text-xs"><input type="checkbox" name={name} value={value} defaultChecked={selected.includes(value)} />{value}</label>)}
    </fieldset>;
}
function ModelSelection({ name, models, selected, label }: { name: string; models: Entity[]; selected: string[]; label: string }) {
    const [order, setOrder] = useState<string[]>(selected);
    const move = (index: number, direction: number) => {
        const next = [...order];
        [next[index], next[index + direction]] = [next[index + direction], next[index]];
        setOrder(next);
    };
    return <fieldset className="col-span-2 space-y-2 rounded-lg border border-border p-3">
        <legend className="text-xs font-bold">{label}</legend>
        {order.map((id, index) => <div key={id} className="flex items-center gap-2 text-xs">
            <input type="hidden" name={name} value={id} />
            <span className="flex-1">{index + 1}. {models.find(model => idOf(model) === id)?.displayName ?? "Missing model"}</span>
            <button type="button" aria-label="Move model up" disabled={index === 0} onClick={() => move(index, -1)}>Up</button>
            <button type="button" aria-label="Move model down" disabled={index === order.length - 1} onClick={() => move(index, 1)}>Down</button>
            <button type="button" aria-label="Remove model" onClick={() => setOrder(order.filter(value => value !== id))}>Remove</button>
        </div>)}
        <select aria-label={`Add ${label.toLowerCase()}`} value="" onChange={event => setOrder([...order, event.target.value])} className="w-full rounded border border-border bg-card p-2 text-xs">
            <option value="" disabled>Add model...</option>
            {models.filter(model => !order.includes(idOf(model))).map(model => <option key={idOf(model)} value={idOf(model)}>{model.displayName}</option>)}
        </select>
    </fieldset>;
}
export const AIEntityCardActions = ({ kind, item }: { kind: Kind; item: Entity }) => {
    const { runtime } = useAIManagement();
    if (!canManageEntity(kind, runtime.permissions)) return null;
    return <div className="flex items-center gap-1">
    <button title="Edit" onClick={() => window.dispatchEvent(new CustomEvent("ai-entity-action", { detail: { action: "edit", kind, item } }))} className="rounded p-1.5 text-muted-foreground hover:text-primary"><HiOutlinePencilSquare /></button>
    <button title="Delete" onClick={() => window.dispatchEvent(new CustomEvent("ai-entity-action", { detail: { action: "delete", kind, item } }))} className="rounded p-1.5 text-muted-foreground hover:text-danger"><HiOutlineTrash /></button>
</div>;
};
