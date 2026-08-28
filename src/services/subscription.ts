import api from "@/api";

export interface SubscriptionRequest {
    planCode: string;
    billingCycle?: "monthly" | "yearly";
    email?: string;
    name?: string;
}

export interface SubscriptionResponse {
    success: boolean;
    message: string;
    subscription: {
        planCode: string;
        planName: string;
        billingCycle: string;
        price: number;
        currency: string;
        checkoutUrl: string;
    };
}

export const subscribeToPlan = async (payload: SubscriptionRequest) => {
    const response = await api.post("/subscription/subscribe", payload);
    return response.data as SubscriptionResponse;
};
