import { useState } from "react";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import { HiOutlineServerStack } from "react-icons/hi2";
import { useAIManagement } from "../AIManagementContext";
import type { AIProviderItem } from "@/services/llms/aiManagement";

function ProviderCard({ provider }: { provider: AIProviderItem }) {
    const context = useAIManagement();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const permissions = context.runtime.permissions ?? [];
    const canManage = permissions.includes("business.manage") && permissions.includes("ai.providers.manage");
    const modelCount = context.models.filter(
        model => model.providerId?.code === provider.code,
    ).length;

    const toggle = async () => {
        setSaving(true);
        setError("");
        setSaved(false);
        try {
            await context.toggleProvider(provider);
            setSaved(true);
        } catch {
            setError("Could not save provider availability. Please retry.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <article className="min-w-[200px] max-w-sm flex-1 basis-[240px] rounded-xl border border-border bg-surface-elevated p-3 shadow-sm">
            <div className="flex items-center gap-2">
                <HiOutlineServerStack className="shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-xs font-black">{provider.name}</h2>
                    <code className="text-[10px] text-muted-foreground">{provider.code}</code>
                </div>
                <Switch
                    size="small"
                    checked={provider.enabled}
                    disabled={saving || !canManage}
                    onChange={() => void toggle()}
                    slotProps={{ input: { "aria-label": `Enable ${provider.name}` } }}
                />
            </div>
            <p className="mb-0 text-[10px] text-muted-foreground">
                {provider.enabled ? "Enabled" : "Disabled"} · {modelCount} models · {provider.configured ? "Environment configured" : "Environment not configured"}
            </p>
            <p className="text-[10px] text-muted-foreground">Health: {provider.health}</p>
            {error && <Alert severity="error">{error}</Alert>}
            {saved && <p role="status" className="text-xs text-success">Saved. Applies to new requests through this connection.</p>}
        </article>
    );
}

export default function ProvidersView() {
    const context = useAIManagement();
    const providers = context.filter(context.providers);
    return (
        <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
                These global switches control new requests through each provider connection, including background work.
                Requests already running can finish. Gateways are separate connections; supplier choices inside an upstream gateway are managed by that gateway.
            </p>
            <div className="flex flex-wrap items-start gap-3">
                {providers.map(provider => <ProviderCard key={provider.id} provider={provider} />)}
            </div>
            {!providers.length && <p className="text-sm text-muted-foreground">No providers match the current filters.</p>}
        </div>
    );
}
