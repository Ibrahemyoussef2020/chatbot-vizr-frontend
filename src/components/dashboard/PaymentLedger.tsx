import { Tooltip } from "@mui/material";
import { HiOutlineBanknotes, HiOutlineCheckCircle, HiOutlineClock, HiOutlineCreditCard, HiOutlineDevicePhoneMobile, HiOutlineExclamationCircle } from "react-icons/hi2";
import CrudActionButton from "@/components/shared/CrudActionButton";
import type { PaymentItem } from "@/services/payments/ledger";
import { formatPaymentAmount, formatPaymentDate, paymentProviderName, paymentStatuses, shortenPaymentReference } from "@/helpers/paymentPresentation";

export const PaymentStatusBadge = ({ status }: { status: string }) => {
    const presentation = paymentStatuses[status] || { label: status, className: "bg-muted text-muted-foreground" };
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${presentation.className}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {presentation.label}
        </span>
    );
};

export const PaymentProviderBadge = ({ provider }: { provider: string }) => {
    const Icon = provider === "vodafone_cash" ? HiOutlineDevicePhoneMobile : HiOutlineCreditCard;
    return (
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface text-primary">
                <Icon size={17} aria-hidden="true" />
            </span>
            {paymentProviderName(provider)}
        </span>
    );
};

export const PaymentSummary = ({ items, total, loading, error }: { items: PaymentItem[]; total: number; loading: boolean; error: boolean }) => {
    const summaries = [
        { label: "Matching transactions", count: total, detail: "Across all matching pages", icon: HiOutlineBanknotes, color: "bg-primary/10 text-primary" },
        { label: "Completed", count: items.filter(item => item.status === "succeeded").length, detail: "On this page", icon: HiOutlineCheckCircle, color: "bg-success/15 text-success" },
        { label: "Awaiting review", count: items.filter(item => item.status === "awaiting_review").length, detail: "On this page", icon: HiOutlineClock, color: "bg-warning/15 text-warning" },
        { label: "Failed", count: items.filter(item => item.status === "failed").length, detail: "On this page", icon: HiOutlineExclamationCircle, color: "bg-danger/10 text-danger" },
    ];
    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Payment summary">
            {summaries.map(({ label, count, detail, icon: Icon, color }) => (
                <article key={label} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={21} aria-hidden="true" /></span>
                    </div>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{loading || error ? "—" : count.toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </article>
            ))}
        </section>
    );
};

export const PaymentTable = ({ items, onView }: { items: PaymentItem[]; onView: (payment: PaymentItem) => void }) => (
    <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm text-foreground">
            <caption className="sr-only">Payment transaction ledger</caption>
            <thead className="border-b border-border bg-surface">
                <tr>{["Transaction", "Customer", "Workspace / plan", "Payment method", "Amount", "Status", "Actions"].map(label => (
                    <th scope="col" className="px-5 py-3.5 text-xs font-semibold text-muted-foreground" key={label}>{label}</th>
                ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
                {items.map(payment => (
                    <tr key={payment._id} className="transition-colors hover:bg-surface">
                        <td className="px-5 py-4">
                            <Tooltip title={payment.reference}>
                                <span className="font-mono text-xs font-semibold" aria-label={payment.reference}>{shortenPaymentReference(payment.reference)}</span>
                            </Tooltip>
                            <p className="mt-1 text-xs text-muted-foreground">{formatPaymentDate(payment.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary" aria-hidden="true">
                                    {(payment.payerName || payment.payerEmail || "?").slice(0, 1).toUpperCase()}
                                </span>
                                <div className="max-w-48">
                                    <p className="truncate font-medium" title={payment.payerName}>{payment.payerName || "Unnamed customer"}</p>
                                    <p className="mt-1 truncate text-xs text-muted-foreground" title={payment.payerEmail}>{payment.payerEmail || "No email"}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-4">
                            <p className="font-medium">{payment.workspaceId?.name || "Unassigned"}</p>
                            <p className="mt-1 text-xs capitalize text-muted-foreground">{payment.planCode.replaceAll("_", " ")}</p>
                        </td>
                        <td className="px-5 py-4"><PaymentProviderBadge provider={payment.provider} /></td>
                        <td className="px-5 py-4">
                            <p className="whitespace-nowrap font-semibold tabular-nums">{formatPaymentAmount(payment.amount, payment.currency)}</p>
                            <p className="mt-1 text-xs capitalize text-muted-foreground">{payment.billingCycle} billing</p>
                        </td>
                        <td className="px-5 py-4"><PaymentStatusBadge status={payment.status} /></td>
                        <td className="px-5 py-4"><CrudActionButton action="read" label={`View payment ${payment.reference}`} onClick={() => onView(payment)} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
