import api from "@/api";

export interface MethodInput {
    label: string;
    isEnabled: boolean;
    isTestMode: boolean;
    sortOrder: number;
    instructions: string;
    supportedCurrencies: string[];
    settings: Record<string, string | number | boolean>;
    credentials: Record<string, string>;
    clearCredentials: string[];
    system_slug?: string;
}

export interface PaymentMethod extends MethodInput {
    provider: string;
    description: string;
    mode: string;
    availableCurrencies: string[];
    settingFields: { key: string; label: string; type: string; required: boolean; min?: number; max?: number; helpText?: string }[];
    credentialFields: { key: string; label: string; type: string; required: boolean; secret?: boolean; environmentKey?: string; placeholder?: string; helpText?: string }[];
    credentialStatus: Record<string, "workspace" | "global" | "environment" | "missing">;
    workspaceName: string;
}

export const listPaymentMethods = async (signal?: AbortSignal, workspaceSlug?: string): Promise<PaymentMethod[]> => {
    const response = await api.get("/admin/payment-methods", { signal, params: { system_slug: workspaceSlug } });
    return response.data.data;
};

export const savePaymentMethod = async (method: PaymentMethod, workspaceSlug?: string): Promise<PaymentMethod> => {
    const input: MethodInput = {
        label: method.label,
        isEnabled: method.isEnabled,
        isTestMode: method.isTestMode,
        sortOrder: method.sortOrder,
        instructions: method.instructions,
        supportedCurrencies: method.supportedCurrencies,
        settings: method.settings,
        credentials: method.credentials || {},
        clearCredentials: method.clearCredentials || [],
        system_slug: workspaceSlug,
    };
    const response = await api.put(`/admin/payment-methods/${method.provider}`, input, { params: { system_slug: workspaceSlug } });
    return response.data.data;
};
