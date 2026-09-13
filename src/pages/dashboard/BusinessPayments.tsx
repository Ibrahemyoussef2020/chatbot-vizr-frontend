import { useEffect, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, Skeleton, TextField } from "@mui/material";
import { HiOutlineArrowPath, HiOutlineBanknotes, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineFunnel, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import { PaymentProviderBadge, PaymentStatusBadge, PaymentSummary, PaymentTable } from "@/components/dashboard/PaymentLedger";
import { formatPaymentAmount, formatPaymentDate, paymentStatuses } from "@/helpers/paymentPresentation";
import { listPayments, type PaymentItem, type PagedResult } from "@/services/core/businessPayments";
import getErrorText from "@/utils/typeErrorText";

const quickStatuses = [
    { value: "all", label: "All transactions" },
    { value: "succeeded", label: "Completed" },
    { value: "awaiting_review", label: "Under review" },
    { value: "pending", label: "Pending" },
];

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
    const hasFilters = Boolean(search || status !== "all" || provider !== "all");

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
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [allowed, search, status, provider, page, retry]);

    const changeStatus = (value: string) => {
        setLoading(true);
        setStatus(value);
        setPage(1);
    };

    const resetFilters = () => {
        setLoading(true);
        setSearch("");
        setStatus("all");
        setProvider("all");
        setPage(1);
    };

    if (!allowed) {
        return <Alert severity="warning">You need permission to view business payments.</Alert>;
    }

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 p-1 sm:p-2">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Payment management</p>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Track transactions across your business workspaces.</p>
                </div>
                <Button variant="outlined" startIcon={<HiOutlineArrowPath aria-hidden="true" />} disabled={loading} onClick={() => {
                    setLoading(true);
                    setRetry(value => value + 1);
                }}>Refresh</Button>
            </header>

            <PaymentSummary items={data.items} total={data.total} loading={loading} error={Boolean(error)} />

            <section className="overflow-hidden rounded-2xl border border-border bg-card" aria-label="Transactions">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><HiOutlineBanknotes size={22} aria-hidden="true" /></span>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Transaction ledger</h2>
                            <p className="text-xs text-muted-foreground" aria-live="polite">{loading ? "Updating transactions…" : error ? "Transactions unavailable" : `${data.total.toLocaleString()} ${hasFilters ? "matching" : "total"} transactions`}</p>
                        </div>
                    </div>
                    {hasFilters && <Button size="small" onClick={resetFilters}>Clear filters</Button>}
                </div>

                <div className="space-y-4 px-5 py-5 sm:px-6">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_200px]">
                        <TextField size="small" label="Search transactions" placeholder="Reference, customer or plan" value={search}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><HiOutlineMagnifyingGlass size={19} aria-hidden="true" /></InputAdornment> } }}
                            onChange={event => {
                                setLoading(true);
                                setSearch(event.target.value);
                                setPage(1);
                            }} />
                        <TextField size="small" label="Payment method" select value={provider} onChange={event => {
                            setLoading(true);
                            setProvider(event.target.value);
                            setPage(1);
                        }}>
                            <MenuItem value="all">All methods</MenuItem>
                            <MenuItem value="stripe">Stripe</MenuItem>
                            <MenuItem value="vodafone_cash">Vodafone Cash</MenuItem>
                        </TextField>
                        <TextField size="small" label="Status" select value={status} onChange={event => changeStatus(event.target.value)}>
                            <MenuItem value="all">All statuses</MenuItem>
                            {Object.entries(paymentStatuses).map(([value, presentation]) => <MenuItem key={value} value={value}>{presentation.label}</MenuItem>)}
                        </TextField>
                    </div>
                    <div className="flex flex-wrap gap-2" aria-label="Quick status filters">
                        {quickStatuses.map(filter => (
                            <button key={filter.value} type="button" aria-pressed={status === filter.value}
                                disabled={status === filter.value}
                                onClick={() => changeStatus(filter.value)}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${status === filter.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}>
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error ? (
                    <div className="px-5 pb-5"><Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Retry</Button>}>{error}</Alert></div>
                ) : loading ? (
                    <div className="space-y-4 border-t border-border p-5" role="status" aria-label="Loading payments">
                        {[0, 1, 2, 3].map(index => <Skeleton key={index} variant="rounded" height={54} />)}
                        <span className="sr-only">Loading payments</span>
                    </div>
                ) : data.items.length ? (
                    <PaymentTable items={data.items} onView={setSelected} />
                ) : (
                    <div className="flex flex-col items-center gap-3 border-t border-border px-5 py-16 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground"><HiOutlineFunnel size={25} aria-hidden="true" /></span>
                        <h3 className="text-base font-semibold text-foreground">{hasFilters ? "No matching transactions" : "No payments yet"}</h3>
                        <p className="max-w-sm text-sm text-muted-foreground">{hasFilters ? "Try a different search or clear your filters to see all transactions." : "Payment records will appear here when they are added."}</p>
                        {hasFilters && <Button onClick={resetFilters}>Clear filters</Button>}
                    </div>
                )}

                {!error && !loading && (
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-muted-foreground sm:px-6">
                        <p>{data.total ? `Showing ${(page - 1) * 20 + 1}–${(page - 1) * 20 + data.items.length} of ${data.total}` : "Showing 0 transactions"}</p>
                        <div className="flex items-center gap-3">
                            <Button size="small" disabled={page <= 1} startIcon={<HiOutlineChevronLeft aria-hidden="true" />} onClick={() => {
                                setLoading(true);
                                setPage(value => value - 1);
                            }}>Previous</Button>
                            <span>Page {page} of {Math.max(1, data.pages)}</span>
                            <Button size="small" disabled={page >= data.pages} endIcon={<HiOutlineChevronRight aria-hidden="true" />} onClick={() => {
                                setLoading(true);
                                setPage(value => value + 1);
                            }}>Next</Button>
                        </div>
                    </footer>
                )}
            </section>

            <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
                <DialogTitle>Transaction details</DialogTitle>
                <DialogContent>
                    {selected && <div className="space-y-5">
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                            <div>
                                <p className="text-2xl font-bold text-foreground">{formatPaymentAmount(selected.amount, selected.currency)}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{formatPaymentDate(selected.createdAt)}</p>
                            </div>
                            <PaymentStatusBadge status={selected.status} />
                        </div>
                        <PaymentProviderBadge provider={selected.provider} />
                        <dl className="grid gap-4 sm:grid-cols-2">
                            {Object.entries({ Reference: selected.reference, Customer: selected.payerName, Email: selected.payerEmail, Workspace: selected.workspaceId?.name, Plan: selected.planCode, "Billing cycle": selected.billingCycle, "Provider reference": selected.providerRef, "Review note": selected.reviewNote, "Failure reason": selected.failureReason }).map(([label, value]) => (
                                <div key={label} className={label === "Reference" || label === "Provider reference" ? "sm:col-span-2" : ""}>
                                    <dt className="text-xs text-muted-foreground">{label}</dt>
                                    <dd className="mt-1 break-words text-sm font-medium text-foreground">{value || "—"}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>}
                </DialogContent>
                <DialogActions><Button onClick={() => setSelected(null)}>Close</Button></DialogActions>
            </Dialog>
        </div>
    );
};

export default BusinessPayments;
