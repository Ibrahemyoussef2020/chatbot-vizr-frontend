import { useState } from "react";
import { fieldsFromJson, fieldsToJson, newKnowledgeField, type FieldType, type KnowledgeField } from "@/utils/structuredKnowledge";

interface Props {
    fields: KnowledgeField[];
    onChange: (fields: KnowledgeField[]) => void;
    array?: boolean;
    depth?: number;
}
const inputClass = "min-w-0 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground";

export default function StructuredKnowledgeEditor({ fields, onChange, array = false, depth = 0 }: Props) {
    const [dragId, setDragId] = useState<string | null>(null);
    const [json, setJson] = useState("");
    const [error, setError] = useState("");
    const update = (index: number, changes: Partial<KnowledgeField>) => {
        onChange(fields.map((field, i) => i === index ? { ...field, ...changes } : field));
    };
    const move = (from: number, to: number) => {
        if (from < 0 || to < 0 || to >= fields.length) return;
        const next = [...fields];
        const [field] = next.splice(from, 1);
        next.splice(to, 0, field);
        onChange(next);
    };
    const importJson = () => {
        try {
            if (new TextEncoder().encode(json).length > 50000) throw new Error("JSON must be under 50 KB.");
            const parsed = JSON.parse(json);
            if (Array.isArray(parsed) || parsed === null || typeof parsed !== "object") throw new Error("The top level must be a JSON object.");
            const imported = fieldsFromJson(parsed);
            fieldsToJson(imported);
            onChange(imported);
            setError("");
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Invalid JSON.");
        }
    };

    return (
        <div className="space-y-3">
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="space-y-3 rounded-xl border border-border p-3"
                    onDragOver={event => { if (dragId) event.preventDefault(); }}
                    onDrop={event => {
                        if (!dragId) return;
                        event.preventDefault();
                        event.stopPropagation();
                        move(fields.findIndex(item => item.id === dragId), index);
                        setDragId(null);
                    }}
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button" draggable aria-label={`Drag field ${index + 1}`}
                            className="cursor-grab px-2 text-muted-foreground"
                            onDragStart={event => {
                                event.stopPropagation();
                                event.dataTransfer.setData("text/plain", field.id);
                                event.dataTransfer.effectAllowed = "move";
                                setDragId(field.id);
                            }}
                            onDragEnd={() => setDragId(null)}
                        >⠿</button>
                        {array ? <span className="text-xs">Item {index + 1}</span> : (
                            <input aria-label={`Field ${index + 1} name`} className={`${inputClass} flex-1`} placeholder="Field name" value={field.name} onChange={event => update(index, { name: event.target.value })} />
                        )}
                        <select aria-label={`Field ${index + 1} type`} className={inputClass} value={field.type} onChange={event => update(index, { type: event.target.value as FieldType })}>
                            {["text", "number", "boolean", "null", "object", "array"].map(type => <option key={type}>{type}</option>)}
                        </select>
                        <button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} className="text-xs disabled:opacity-30" aria-label={`Move field ${index + 1} up`}>↑</button>
                        <button type="button" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)} className="text-xs disabled:opacity-30" aria-label={`Move field ${index + 1} down`}>↓</button>
                        <button type="button" className="text-xs text-danger" onClick={() => onChange(fields.filter(item => item.id !== field.id))}>Remove</button>
                    </div>
                    {field.type === "object" || field.type === "array" ? (
                        depth < 8 ? <StructuredKnowledgeEditor fields={field.children} onChange={children => update(index, { children })} array={field.type === "array"} depth={depth + 1} /> : <p role="alert" className="text-xs text-danger">Maximum nesting depth reached.</p>
                    ) : field.type === "boolean" ? (
                        <select aria-label={`Value for ${field.name || index + 1}`} className={inputClass} value={field.value === "true" ? "true" : "false"} onChange={event => update(index, { value: event.target.value })}>
                            <option value="false">False</option><option value="true">True</option>
                        </select>
                    ) : field.type !== "null" && (
                        <input aria-label={`Value for ${field.name || index + 1}`} type={field.type === "number" ? "number" : "text"} step="any" className={`${inputClass} w-full`} value={field.value} onChange={event => update(index, { value: event.target.value })} />
                    )}
                </div>
            ))}
            <button type="button" className="rounded-lg border border-dashed border-primary px-3 py-2 text-xs font-bold text-primary" onClick={() => onChange([...fields, newKnowledgeField()])}>+ Add {array ? "item" : "field"}</button>
            {depth === 0 && (
                <details className="text-xs">
                    <summary className="cursor-pointer font-semibold">Import JSON object</summary>
                    <textarea aria-label="JSON object to import" rows={6} className={`${inputClass} mt-3 w-full font-mono`} value={json} onChange={event => setJson(event.target.value)} placeholder={'{"products": [{"name": "Basic", "price": 0}]}'} />
                    <p className="text-muted-foreground">Import replaces the editor fields. Save the configuration to persist changes.</p>
                    <button type="button" className="font-bold text-primary" onClick={importJson}>Use JSON</button>
                    {error && <p role="alert" className="text-danger">{error}</p>}
                </details>
            )}
        </div>
    );
}
