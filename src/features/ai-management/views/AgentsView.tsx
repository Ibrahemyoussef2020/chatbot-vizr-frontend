import AIEntityCrud, { AIEntityCardActions } from "@/components/dashboard/AIEntityCrud";
import DefaultAgentControl from "../DefaultAgentControl";
import { useAIManagement } from "../AIManagementContext";

export default function AgentsView() {
    const context = useAIManagement();
    const agents = context.filter(context.agents);
    return (
        <div className="space-y-3">
            <DefaultAgentControl key={context.workspace} />
            <AIEntityCrud
                kind="Agents"
                items={agents}
                providers={context.providers}
                models={context.models}
                agents={context.agents}
                workspace={context.workspace}
                onChanged={() => void context.reload()}
            />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {agents.map(agent => (
                    <article key={agent._id} className="space-y-3 rounded-xl border border-border bg-surface-elevated p-4 shadow-sm">
                        <header className="flex items-center justify-between gap-2">
                            <h2 className="m-0 text-sm font-black">{agent.name}</h2>
                            <AIEntityCardActions kind="Agents" item={agent} />
                        </header>
                        <div className="flex gap-2 text-xs">
                            <span className={agent.enabled ? "text-success" : "text-danger"}>{agent.enabled ? "Enabled" : "Disabled"}</span>
                            {context.runtime.defaultAgentId === agent._id && <span className="text-primary">Workspace default</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.description}</p>
                        <dl className="grid grid-cols-2 gap-2 text-xs">
                            <dt>Role</dt><dd className="m-0">{agent.securityRoleId?.name ?? "Missing role"}</dd>
                            <dt>Primary model</dt><dd className="m-0">{agent.primaryModelId?.displayName ?? "Missing model"}</dd>
                            <dt>Channels</dt><dd className="m-0">{agent.channels?.length ? agent.channels.join(", ") : "All channels"}</dd>
                            <dt>Output limit</dt><dd className="m-0">{agent.maxOutputTokens} tokens</dd>
                        </dl>
                    </article>
                ))}
            </div>
            {!agents.length && <p className="text-sm text-muted-foreground">No agents match the current filters.</p>}
        </div>
    );
}
