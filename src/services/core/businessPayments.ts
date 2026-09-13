import api from "@/api";

export interface PaymentItem {
    _id: string;
    reference: string;
    planCode: string;
    provider: string;
    billingCycle: string;
    amount: number;
    currency: string;
    status: string;
    payerName?: string;
    payerEmail?: string;
    providerRef?: string;
    reviewNote?: string;
    failureReason?: string;
    createdAt: string;
    workspaceId?: { name: string; slug: string } | null;
}

export interface PagedResult<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
}

export const listPayments = async (params: Record<string, string | number>, signal?: AbortSignal): Promise<PagedResult<PaymentItem>> => {
    const response = await api.get("/admin/payments", { params, signal });
    return response.data.data;
};
