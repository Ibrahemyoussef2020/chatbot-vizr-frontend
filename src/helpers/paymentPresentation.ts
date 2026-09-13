export const paymentStatuses: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-primary/10 text-primary" },
    awaiting_review: { label: "Under review", className: "bg-warning/15 text-warning" },
    succeeded: { label: "Completed", className: "bg-success/15 text-success" },
    failed: { label: "Failed", className: "bg-danger/10 text-danger" },
    refunded: { label: "Refunded", className: "bg-primary/10 text-primary" },
    cancelled: { label: "Canceled", className: "bg-muted text-muted-foreground" },
};

export const paymentProviderName = (provider: string) => {
    if (provider === "stripe") return "Stripe";
    if (provider === "vodafone_cash") return "Vodafone Cash";
    return provider;
};

export const formatPaymentAmount = (amount: number, currency: string) => {
    try {
        return new Intl.NumberFormat("en", { style: "currency", currency }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
};

export const formatPaymentDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

export const shortenPaymentReference = (reference: string) => {
    return reference.length > 30 ? `${reference.slice(0, 14)}…${reference.slice(-8)}` : reference;
};
