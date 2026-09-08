import { useAIManagement } from "../AIManagementContext";

export default function RequestLogsView() {
    const context = useAIManagement();
    const logs = context.filter(context.logs);
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card">
            <header className="border-b border-border p-4">
                <h2 className="m-0 text-sm font-bold">Execution logs</h2>
                <p className="mb-0 text-xs text-muted-foreground">Latest 200 attempts. Use Refresh to load new records.</p>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-surface-muted">
                        <tr>{["Time", "Provider / model", "Type", "Tokens", "Latency", "Outcome"].map(label => <th key={label} className="p-3">{label}</th>)}</tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id} className="border-t border-border">
                                <td className="p-3">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "Unknown"}</td>
                                <td className="p-3"><b>{log.provider}</b><br />{log.model}</td>
                                <td className="p-3">{log.requestType}</td>
                                <td className="p-3">{log.usageReported ? log.totalTokens : "Not reported"}</td>
                                <td className="p-3">{log.latencyMs} ms</td>
                                <td className="p-3">{log.status}{log.statusCode ? ` (${log.statusCode})` : ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!logs.length && <p className="p-4 text-sm text-muted-foreground">No executions match these filters.</p>}
        </section>
    );
}
