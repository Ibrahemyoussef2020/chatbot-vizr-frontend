import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { isAxiosError } from "axios";
import { updateAIRuntime } from "@/services/llms/aiManagement";
import { useAIManagement } from "./AIManagementContext";

export default function DefaultAgentControl() {
    const context = useAIManagement();
    const [selected, setSelected] = useState(context.runtime.defaultAgentId ?? "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const canManage = context.runtime.permissions?.includes("ai.agents.manage") ?? false;
    const save = async () => {
        setSaving(true);
        setError("");
        try {
            await updateAIRuntime(selected || null, context.workspace);
            await context.reload();
        } catch (failure) {
            setError(isAxiosError(failure) ? failure.response?.data?.message || "Could not save the default agent." : "Could not save the default agent.");
        } finally {
            setSaving(false);
        }
    };
    return (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <label className="grid gap-2 text-xs font-bold">
                Default agent for customer replies
                <select value={selected} onChange={event => setSelected(event.target.value)} disabled={saving || !canManage} className="rounded-lg border border-border bg-card p-2 text-foreground">
                    <option value="">Environment defaults (no managed agent)</option>
                    {context.agents.map(agent => <option key={agent._id} value={agent._id}>{agent.name}{agent.enabled ? "" : " (disabled)"}</option>)}
                </select>
            </label>
            <p className="text-xs text-muted-foreground">
                Saved agent settings apply to new customer replies on its allowed channels.
                A disabled or unavailable assigned agent blocks replies until you fix or replace it.
            </p>
            {error && <Alert severity="error">{error}</Alert>}
            <Button variant="contained" disabled={saving || !canManage || selected === (context.runtime.defaultAgentId ?? "")} onClick={() => void save()}>
                {saving ? "Saving..." : "Save default agent"}
            </Button>
        </section>
    );
}
