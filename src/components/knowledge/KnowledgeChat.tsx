import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import type { KnowledgeMessage } from "@/services/knowledge/knowledgeBase";

interface Props {
    messages: KnowledgeMessage[];
    busy: boolean;
    disabled: boolean;
    onAsk: (question: string) => Promise<void>;
}

const KnowledgeChat = ({ messages, busy, disabled, onAsk }: Props) => {
    const [question, setQuestion] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, busy]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const value = question.trim();
        if (!value || busy || disabled) return;
        setQuestion("");
        await onAsk(value);
    };

    return (
        <section className="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated">
            <header className="border-b border-border px-5 py-4">
                <h2 className="m-0 text-lg font-extrabold text-foreground">Knowledge chatbot</h2>
                <p className="m-0 text-xs text-muted-foreground">Answers are grounded in this session's ready sources.</p>
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {!messages.length && (
                    <div className="grid h-full place-content-center text-center text-sm text-muted-foreground">
                        <p className="m-0">Upload a source, then ask a question about its content.</p>
                    </div>
                )}
                {messages.map((message) => (
                    <article key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-primary text-white" : "bg-surface-muted text-foreground"}`}>
                        <p className="m-0 whitespace-pre-wrap">{message.content}</p>
                        {message.role === "assistant" && message.citations?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-2">
                                {message.citations.map((citation) => <span key={citation.sourceId} className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{citation.name}</span>)}
                            </div>
                        )}
                    </article>
                ))}
                {busy && <div className="w-fit rounded-2xl bg-surface-muted px-4 py-3 text-sm text-muted-foreground">Thinking...</div>}
                <div ref={endRef} />
            </div>
            <form className="flex gap-2 border-t border-border p-4" onSubmit={submit}>
                <TextField fullWidth size="small" placeholder={disabled ? "Upload a ready source first" : "Ask from your knowledge..."} value={question} disabled={disabled || busy} onChange={(event) => setQuestion(event.target.value)} />
                <Button type="submit" variant="contained" disabled={disabled || busy || !question.trim()} aria-label="Send question"><HiOutlinePaperAirplane /></Button>
            </form>
        </section>
    );
};

export default KnowledgeChat;
