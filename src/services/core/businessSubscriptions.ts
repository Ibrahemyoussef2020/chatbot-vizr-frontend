import api from "@/api";
import type { PagedResult } from "./businessPayments";

export interface SubscriptionItem {
    _id: string;
    workspaceId?: { name: string; slug: string } | null;
    planId?: { name: string } | null;
    planCode: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    provider: string;
    cancelAtPeriodEnd: boolean;
    canceledAt?: string;
}

export const listSubscriptions = async (params: Record<string, string | number>, signal?: AbortSignal): Promise<PagedResult<SubscriptionItem>> => {
    const response = await api.get("/admin/subscriptions", { params, signal });
    return response.data.data;
};
