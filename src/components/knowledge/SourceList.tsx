import { HiOutlineDocumentText } from "react-icons/hi2";
import type { KnowledgeSource } from "@/services/knowledge/knowledgeBase";

const formatBytes = (bytes: number) => bytes < 1_000_000 ? `${Math.ceil(bytes / 1000)} KB` : `${(bytes / 1_000_000).toFixed(1)} MB`;

const SourceList = ({ sources }: { sources: KnowledgeSource[] }) => (
    <div className="grid gap-2">
        {sources.map((source) => (
            <article key={source.id} className="rounded-xl border border-border bg-surface-elevated p-3">
                <div className="flex items-start gap-3">
                    <HiOutlineDocumentText className="mt-0.5 shrink-0 text-xl text-primary" />
                    <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-sm font-bold text-foreground" title={source.name}>{source.name}</p>
                        <p className="m-0 text-xs text-muted-foreground">{source.kind} · {formatBytes(source.size)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase ${source.status === "ready" ? "bg-success/15 text-success" : source.status === "failed" ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning"}`}>
                        {source.status}
                    </span>
                </div>
                {source.error_message && <p className="mb-0 mt-2 text-xs text-danger">{source.error_message}</p>}
            </article>
        ))}
        {!sources.length && <p className="py-5 text-center text-sm text-muted-foreground">No sources uploaded yet.</p>}
    </div>
);

export default SourceList;
