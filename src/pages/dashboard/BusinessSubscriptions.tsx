import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import CrudActionButton from "@/components/shared/CrudActionButton";
import getErrorText from "@/utils/typeErrorText";
import { listSubscriptions, type SubscriptionItem } from "@/services/payments/subscriptions";
import type { PagedResult } from "@/services/payments/ledger";

const date = (value?: string) => value ? new Date(value).toLocaleDateString() : "—";

const BusinessSubscriptions = () => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("subscriptions.view"));
    const [data, setData] = useState<PagedResult<SubscriptionItem>>({ items: [], total: 0, page: 1, pages: 0 });
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [retry, setRetry] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<SubscriptionItem | null>(null);
    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await listSubscriptions({ search, status, page }, controller.signal);
                if (!controller.signal.aborted) setData(result);
            } catch (failure) {
                if (!controller.signal.aborted) setError(getErrorText(failure));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        const timer = setTimeout(() => void load(), 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [allowed, search, status, page, retry]);

    if (!allowed) return <Alert severity="warning">You need permission to view business subscriptions.</Alert>;
    return (
        <div className="mx-auto max-w-[1400px] space-y-6 p-2">
            <header>
                <h1 className="text-3xl font-extrabold text-foreground">Subscriptions</h1>
                <p className="text-muted-foreground">Subscriber plans and billing periods · {data.total} matching subscriptions</p>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Search plan code" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
                <TextField label="Status" select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
                    {["all", "trialing", "active", "past_due", "canceled", "expired"].map(value => <MenuItem key={value} value={value}>{value.replaceAll("_", " ")}</MenuItem>)}
                </TextField>
            </div>
            {error && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Retry</Button>}>{error}</Alert>}
            {loading ? <CircularProgress aria-label="Loading subscriptions" /> : !error && (
                <>
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-left text-sm text-foreground">
                            <thead className="bg-surface"><tr>{["Workspace", "Plan", "Status", "Cycle", "Period ends", "Details"].map(label => <th key={label} className="p-4">{label}</th>)}</tr></thead>
                            <tbody>{data.items.map(subscription => (
                                <tr key={subscription._id} className="border-t border-border">
                                    <td className="p-4">{subscription.workspaceId?.name || "Unavailable workspace"}</td>
                                    <td className="p-4">{subscription.planId?.name || subscription.planCode}</td>
                                    <td className="p-4">{subscription.status.replaceAll("_", " ")}{subscription.cancelAtPeriodEnd ? " · Cancels at period end" : ""}</td>
                                    <td className="p-4">{subscription.billingCycle}</td>
                                    <td className="p-4">{date(subscription.currentPeriodEnd)}</td>
                                    <td className="p-4"><CrudActionButton action="read" label={`View ${subscription.planCode} subscription for ${subscription.workspaceId?.name || "workspace"}`} onClick={() => setSelected(subscription)} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                        {!data.items.length && <p className="p-5 text-muted-foreground">No subscriptions match these filters.</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
                        <span>Page {page} of {Math.max(1, data.pages)}</span>
                        <Button disabled={page >= data.pages} onClick={() => setPage(value => value + 1)}>Next</Button>
                    </div>
                </>
            )}
            <Dialog open={Boolean(selected)} fullWidth onClose={() => setSelected(null)}>
                <DialogTitle>Subscription details</DialogTitle>
                <DialogContent>{selected && <dl className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries({ Workspace: selected.workspaceId?.name, Plan: selected.planCode, Status: selected.status, Provider: selected.provider, "Billing cycle": selected.billingCycle, "Period starts": date(selected.currentPeriodStart), "Period ends": date(selected.currentPeriodEnd), "Cancel at period end": selected.cancelAtPeriodEnd ? "Yes" : "No", "Canceled on": date(selected.canceledAt) }).map(([label, value]) => (
                        <div key={label}><dt className="font-bold">{label}</dt><dd>{value || "—"}</dd></div>
                    ))}
                </dl>}</DialogContent>
                <DialogActions><Button onClick={() => setSelected(null)}>Close</Button></DialogActions>
            </Dialog>
        </div>
    );
};

export default BusinessSubscriptions;
