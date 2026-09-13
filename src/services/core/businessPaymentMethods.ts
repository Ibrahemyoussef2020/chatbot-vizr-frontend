import api from "@/api";

export interface MethodInput {
    label: string;
    isEnabled: boolean;
    isTestMode: boolean;
    sortOrder: number;
    instructions: string;
    supportedCurrencies: string[];
    settings: Record<string, string | number | boolean>;
}

export interface PaymentMethod extends MethodInput {
    provider: string;
    description: string;
    mode: string;
    availableCurrencies: string[];
    settingFields: { key: string; label: string; type: string; required: boolean; min?: number; max?: number; helpText?: string }[];
}

export const listPaymentMethods = async (signal?: AbortSignal): Promise<PaymentMethod[]> => {
    const response = await api.get("/admin/payment-methods", { signal });
    return response.data.data;
};

export const savePaymentMethod = async (method: PaymentMethod): Promise<PaymentMethod> => {
    const input: MethodInput = {
        label: method.label,
        isEnabled: method.isEnabled,
        isTestMode: method.isTestMode,
        sortOrder: method.sortOrder,
        instructions: method.instructions,
        supportedCurrencies: method.supportedCurrencies,
        settings: method.settings,
    };
    const response = await api.put(`/admin/payment-methods/${method.provider}`, input);
    return response.data.data;
};
