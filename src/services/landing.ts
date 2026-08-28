import api from "@/api";

export interface CardItem {
    title: string;
    description: string;
    label?: string;
    number?: string;
    tags?: string[];
}

export interface HeroMetricItem {
    label: string;
    value: string;
}

export interface ConversationItem {
    sender: "customer" | "assistant";
    label: string;
    description: string;
}

export interface AnalyticsItem {
    label: string;
    value: string;
    description: string;
    change?: string;
}

export interface RoiSettingItem {
    label: string;
    value: number;
}

export interface IndustryItem {
    code: string;
    title: string;
    label: string;
    description: string;
    question: string;
    answer: string;
    tags: string[];
}

export interface ComparisonItem {
    label: string;
    title: string;
    description: string;
    status: "positive" | "negative";
}

export interface PlanItem {
    code: string;
    name: string;
    description: string;
    eyebrow?: string;
    ctaLabel?: string;
    ctaPath?: string;
    monthlyPrice: number | null;
    yearlyPrice: number | null;
    currency: string;
    popular: boolean;
    features: string[];
}

export type LandingSectionItem =
    | string
    | CardItem
    | HeroMetricItem
    | ConversationItem
    | AnalyticsItem
    | RoiSettingItem
    | IndustryItem
    | ComparisonItem
    | PlanItem;

export interface ContentSection {
    type: string;
    eyebrow?: string;
    heading?: string;
    description?: string;
    items: LandingSectionItem[];
}

export interface LandingPageContent {
    slug: string;
    eyebrow?: string;
    title: string;
    description?: string;
    sections: ContentSection[];
}

export const getLandingPage = async (
    slug: string,
    signal?: AbortSignal,
): Promise<LandingPageContent> => {
    const response = await api.get<{ page: LandingPageContent }>(
        `/landing/${slug}`,
        { signal },
    );

    return response.data.page;
};
