import api from "@/api";

export interface PlanInput {
    code: string;
    name: string;
    description: string;
    currency: string;
    pricing: { monthly: number | null; yearly: number | null };
    status: "draft" | "published" | "archived";
    visibility: "public" | "private";
    popular: boolean;
    trialDays: number;
    sortOrder: number;
    features: string[];
}

export interface BusinessPlan extends PlanInput {
    _id: string;
}

export const listPlans = async (signal?: AbortSignal): Promise<BusinessPlan[]> => {
    const response = await api.get("/admin/pricings", { signal });
    return response.data.data;
};

export const savePlan = async (input: PlanInput, id?: string): Promise<BusinessPlan> => {
    const response = id
        ? await api.put(`/admin/pricings/${id}`, input)
        : await api.post("/admin/pricings", input);
    return response.data.data;
};

export const deletePlan = async (id: string) => {
    await api.delete(`/admin/pricings/${id}`);
};
