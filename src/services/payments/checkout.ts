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

export const subscribeToPlan = async (payload: SubscriptionRequest, onboarding = false) => {
    const endpoint = onboarding ? "/subscription/onboarding/subscribe" : "/subscription/subscribe";
    const response = await api.post(endpoint, payload);
    return response.data as SubscriptionResponse;
};

export const startFreePlan = async (planCode: string, billingCycle: "monthly" | "yearly") => {
    const response = await api.post("/subscription/onboarding/free-plan", { planCode, billingCycle });
    return response.data;
};

export const getSubscriptionStatus = async () => {
    const response = await api.get<{ data: { active: boolean; planCode: string | null } }>("/subscription/onboarding/status");
    return response.data.data;
};
