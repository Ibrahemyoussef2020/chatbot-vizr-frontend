import api from "@/api";

export interface SubscriptionRequest {
    planCode: string;
    provider: "stripe" | "vodafone_cash";
    billingCycle?: "monthly" | "yearly";
    email?: string;
    name?: string;
    payerFields?: Record<string, string>;
}

export interface SubscriptionResponse {
    success: boolean;
    message: string;
    checkout: {
        reference: string;
        provider: "stripe" | "vodafone_cash";
        mode: "redirect" | "manual";
        status: "pending" | "awaiting_review";
        planCode: string;
        planName: string;
        billingCycle: string;
        amount: number;
        currency: string;
        checkoutUrl?: string;
        instructions?: string;
    };
}

export const subscribeToPlan = async (payload: SubscriptionRequest) => {
    const response = await api.post("/subscription/subscribe", payload);
    return response.data as SubscriptionResponse;
};
