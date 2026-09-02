export type ChartKind = "bars" | "progress" | "donut" | "timeline";
export type SchemaStatus = "pending" | "generating" | "ready" | "failed";

export interface GeneratedChart {
    title: string;
    description?: string;
    kind: ChartKind;
    items: Array<{ label: string; value: number; detail?: string; tone?: "primary" | "success" | "warning" | "danger" }>;
}

export interface GeneratedSection {
    id: string;
    schemaId: string;
    order: number;
    title: string;
    description: string;
    notes: Array<{ title: string; description: string; meta?: string; status?: string }>;
    charts: GeneratedChart[];
    status: SchemaStatus;
    error?: string;
    generationAttempt: number;
}

export interface GeneratedOutput {
    id: string;
    sessionId: string;
    kind: "plan" | "report";
    title: string;
    description: string;
    category: string;
    status: "draft" | "generating" | "partial" | "ready" | "failed";
    version: number;
    isSaved: boolean;
    isShared: boolean;
    schemaCount: number;
    schemaStatus: Partial<Record<SchemaStatus, number>>;
    createdAt: string;
    updatedAt: string;
    sections: GeneratedSection[];
}

export interface GeneratedSectionInput {
    title: string;
    description: string;
    notes: GeneratedSection["notes"];
    charts: GeneratedChart[];
}
