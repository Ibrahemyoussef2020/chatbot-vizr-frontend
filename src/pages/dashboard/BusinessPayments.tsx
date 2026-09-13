import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { useAppSelector } from "@/redux/store";
import { listPayments, type PaymentItem, type PagedResult } from "@/services/core/businessPayments";
import getErrorText from "@/utils/typeErrorText";

const BusinessPayments = () => {
    const allowed = useAppSelector(state => state.auth.user?.permissions?.includes("payments.view"));
    const [data, setData] = useState<PagedResult<PaymentItem>>({ items: [], total: 0, page: 1, pages: 0 });
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [provider, setProvider] = useState("all");
    const [page, setPage] = useState(1);
    const [retry, setRetry] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selected, setSelected] = useState<PaymentItem | null>(null);

    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await listPayments({ search, status, provider, page }, controller.signal);
                if (!controller.signal.aborted) setData(result);
            } catch (failure) {
                if (!controller.signal.aborted) setError(getErrorText(failure));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        const timer = setTimeout(() => void load(), 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [allowed, search, status, provider, page, retry]);

    if (!allowed) return <Alert severity="warning">You need permission to view business payments.</Alert>;
    return (
        <div className="mx-auto max-w-[1400px] space-y-6 p-2">
            <header>
                <h1 className="text-3xl font-extrabold text-foreground">Payments</h1>
                <p className="text-muted-foreground">Business transaction ledger · {data.total} matching payments</p>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
                <TextField label="Search reference, payer or plan" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
                <TextField label="Status" select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
                    {["all", "pending", "awaiting_review", "succeeded", "failed", "refunded", "cancelled"].map(value => <MenuItem key={value} value={value}>{value.replaceAll("_", " ")}</MenuItem>)}
                </TextField>
                <TextField label="Provider" select value={provider} onChange={event => { setProvider(event.target.value); setPage(1); }}>
                    {["all", "stripe", "vodafone_cash"].map(value => <MenuItem key={value} value={value}>{value.replaceAll("_", " ")}</MenuItem>)}
                </TextField>
            </div>
            {error && <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Retry</Button>}>{error}</Alert>}
            {loading ? <CircularProgress aria-label="Loading payments" /> : !error && (
                <>
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full text-left text-sm text-foreground">
                            <thead className="bg-surface"><tr>{["Reference", "Payer / workspace", "Plan", "Amount", "Provider", "Status", "Details"].map(label => <th className="p-4" key={label}>{label}</th>)}</tr></thead>
                            <tbody>{data.items.map(payment => (
                                <tr key={payment._id} className="border-t border-border">
                                    <td className="p-4">{payment.reference}</td>
                                    <td className="p-4">{payment.payerName || payment.payerEmail || "—"}<span className="block text-muted-foreground">{payment.workspaceId?.name}</span></td>
                                    <td className="p-4">{payment.planCode}</td>
                                    <td className="p-4">{payment.currency} {payment.amount}</td>
                                    <td className="p-4">{payment.provider}</td>
                                    <td className="p-4">{payment.status.replaceAll("_", " ")}</td>
                                    <td className="p-4"><Button onClick={() => setSelected(payment)}>View</Button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                        {!data.items.length && <p className="p-5 text-muted-foreground">No payments match these filters.</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
                        <span>Page {page} of {Math.max(1, data.pages)}</span>
                        <Button disabled={page >= data.pages} onClick={() => setPage(value => value + 1)}>Next</Button>
                    </div>
                </>
            )}
            <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
                <DialogTitle>Payment {selected?.reference}</DialogTitle>
                <DialogContent>
                    {selected && <dl className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries({ Status: selected.status, Amount: `${selected.currency} ${selected.amount}`, Provider: selected.provider, "Provider reference": selected.providerRef, Plan: selected.planCode, "Billing cycle": selected.billingCycle, Payer: selected.payerEmail, Created: new Date(selected.createdAt).toLocaleString(), "Review note": selected.reviewNote, "Failure reason": selected.failureReason }).map(([label, value]) => (
                            <div key={label}><dt className="font-bold">{label}</dt><dd className="break-words">{value || "—"}</dd></div>
                        ))}
                    </dl>}
                </DialogContent>
                <DialogActions><Button onClick={() => setSelected(null)}>Close</Button></DialogActions>
            </Dialog>
        </div>
    );
};

export default BusinessPayments;
