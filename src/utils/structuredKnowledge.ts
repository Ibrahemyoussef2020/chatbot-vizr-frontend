export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type FieldType = "text" | "number" | "boolean" | "null" | "object" | "array";
export interface KnowledgeField {
    id: string;
    name: string;
    type: FieldType;
    value: string;
    children: KnowledgeField[];
}

export const newKnowledgeField = (): KnowledgeField => ({
    id: crypto.randomUUID(), name: "", type: "text", value: "", children: [],
});

export const fieldsFromJson = (value: JsonValue, depth = 0): KnowledgeField[] => {
    if (depth > 8) throw new Error("Use at most 8 levels of nested fields.");
    if (value === null || typeof value !== "object") throw new Error("Import a JSON object or list.");
    return Object.entries(value).map(([name, item]) => {
        const type: FieldType = item === null ? "null" : Array.isArray(item) ? "array" : typeof item === "object" ? "object" : typeof item === "number" ? "number" : typeof item === "boolean" ? "boolean" : "text";
        return {
            id: crypto.randomUUID(), name, type,
            value: typeof item === "object" ? "" : String(item),
            children: item !== null && typeof item === "object" ? fieldsFromJson(item, depth + 1) : [],
        };
    });
};

export const fieldsToJson = (fields: KnowledgeField[], array = false, depth = 0): JsonValue => {
    if (depth > 8) throw new Error("Use at most 8 levels of nested fields.");
    const names = new Set<string>();
    const entries = fields.map(field => {
        const name = field.name.trim();
        if (!array && (!name || names.has(name) || ["__proto__", "constructor", "prototype"].includes(name) || name.includes(".") || name.startsWith("$"))) {
            throw new Error("Field names must be unique and nonempty. Avoid reserved names, dots and leading $.");
        }
        names.add(name);
        let value: JsonValue = field.value;
        if (field.type === "number") {
            if (!field.value.trim() || !Number.isFinite(Number(field.value))) throw new Error(`Enter a valid number for ${name || "this item"}.`);
            value = Number(field.value);
        } else if (field.type === "boolean") value = field.value === "true";
        else if (field.type === "null") value = null;
        else if (field.type === "object" || field.type === "array") value = fieldsToJson(field.children, field.type === "array", depth + 1);
        return [name, value] as const;
    });
    return array ? entries.map(([, value]) => value) : Object.fromEntries(entries);
};
