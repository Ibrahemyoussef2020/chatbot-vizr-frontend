import { useEffect, useRef, useState, type FormEvent } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { HiOutlineArrowUp, HiOutlinePaperClip } from "react-icons/hi2";
import type { KnowledgeMessage } from "@/services/knowledge/knowledgeBase";

interface Props {
    sessionTitle: string;
    messages: KnowledgeMessage[];
    busy: boolean;
    disabled: boolean;
    loading?: boolean;
    onAsk: (question: string) => Promise<void>;
}

const KnowledgeChat = ({ sessionTitle, messages, busy, disabled, loading = false, onAsk }: Props) => {
    const [question, setQuestion] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, busy]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const value = question.trim();
        if (!value || busy || disabled) return;
        setQuestion("");
        await onAsk(value);
    };

    return (
        <section className="flex min-h-0 flex-1 flex-col bg-background">
            <div className={`theme-scrollbar flex-1 overflow-y-auto px-5 py-7 sm:px-8 lg:px-[8%] ${loading ? "grid place-content-center" : "space-y-5"}`} aria-busy={loading}>
                {loading ? (
                    <div aria-label="Loading conversation"><CircularProgress size={32} /></div>
                ) : !messages.length && (
                    <div className="grid min-h-[420px] place-content-center px-4 text-center">
                        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[24px] border border-primary/20 bg-primary/10 shadow-[0_16px_50px_var(--shadow-color)]">
                            <img src="/robot.png" alt="" className="h-12 w-12 object-contain" />
                        </div>
                        <h2 className="m-0 max-w-2xl text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">What would you like to know about {sessionTitle}?</h2>
                        <p className="mx-auto mb-0 mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Ask questions and explore answers grounded only in the ready sources saved in this session.</p>
                    </div>
                )}
                {!loading && messages.map((message) => (
                    <article key={message.id} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "border border-border bg-surface text-foreground"}`}>
                        <p className="m-0 whitespace-pre-wrap">{message.content}</p>
                        {message.role === "assistant" && message.citations?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-2">
                                {message.citations.map((citation) => <span key={citation.sourceId} className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{citation.name}</span>)}
                            </div>
                        )}
                    </article>
                ))}
                {!loading && busy && <div className="w-fit rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">Thinking...</div>}
                <div ref={endRef} />
            </div>
            <div className="bg-gradient-to-t from-background via-background to-transparent px-4 pb-5 pt-3 sm:px-8 lg:px-[6%]">
                <form className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 shadow-[0_12px_40px_var(--shadow-color)] focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10" onSubmit={submit}>
                    <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-0 bg-transparent text-xl text-muted-foreground" aria-label="Attachments are added from the Upload files page" title="Upload files from the session sources panel"><HiOutlinePaperClip /></button>
                    <input className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder={loading ? "Loading conversation..." : disabled ? "Upload a ready source first" : "Ask about this session..."} value={question} disabled={loading || disabled || busy} onChange={(event) => setQuestion(event.target.value)} />
                    <button type="submit" disabled={disabled || busy || !question.trim()} aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-0 bg-primary text-lg text-primary-foreground transition hover:brightness-110 disabled:bg-muted disabled:text-muted-foreground"><HiOutlineArrowUp /></button>
                </form>
                <p className="mb-0 mt-2 text-center text-[10px] text-muted-foreground">Answers are generated from your uploaded knowledge. Verify important information.</p>
            </div>
        </section>
    );
};

export default KnowledgeChat;
