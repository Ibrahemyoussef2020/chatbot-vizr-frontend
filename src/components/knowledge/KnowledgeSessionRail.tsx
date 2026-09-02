import { useState } from "react";
import { HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { Link } from "react-router-dom";
import type { KnowledgeSession } from "@/services/knowledge/knowledgeBase";

type Section = "chat" | "plans" | "reports";

const sessionHref = (sessionId: string, section: Section) => section === "chat" ? `/dashboard/knowledge/${sessionId}#chat` : `/dashboard/knowledge/${sessionId}/${section}`;

const KnowledgeSessionRail = ({ sessions, activeSessionId, section }: { sessions: KnowledgeSession[]; activeSessionId: string; section: Section }) => {
    const [query, setQuery] = useState("");
    const visible = sessions.filter((session) => session.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    const labels = { chat: "Knowledge chat", plans: "Knowledge plans", reports: "Knowledge reports" };

    return (
        <aside className="hidden min-h-0 flex-col border-r border-border bg-surface lg:flex">
            <div className="border-b border-border p-5">
                <Link to={`/dashboard/knowledge/${section === "chat" ? "chat" : section}`} className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-primary no-underline"><HiOutlineArrowLeft /> {labels[section]}</Link>
                <h2 className="m-0 text-xl font-extrabold text-foreground">Choose a session</h2>
                <p className="mb-4 mt-1 text-xs text-muted-foreground">Switch context without leaving this {section === "chat" ? "conversation" : section.slice(0, -1)}.</p>
                <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-muted-foreground focus-within:border-primary">
                    <HiOutlineMagnifyingGlass /><span className="sr-only">Search sessions</span>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sessions..." className="min-w-0 flex-1 border-0 bg-transparent text-xs text-foreground outline-none" />
                </label>
            </div>
            <nav className="theme-scrollbar flex-1 space-y-2 overflow-y-auto p-3" aria-label={`Sessions for ${section}`}>
                {visible.map((session) => (
                    <Link key={session.id} to={sessionHref(session.id, section)} className={`flex items-center gap-3 rounded-xl border p-3 no-underline transition ${session.id === activeSessionId ? "border-primary/30 bg-primary/10" : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-muted"}`}>
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${session.id === activeSessionId ? "bg-primary text-primary-foreground" : "bg-surface-muted text-primary"}`}><HiOutlineBookOpen /></span>
                        <span className="min-w-0 flex-1"><strong className={`block truncate text-sm ${session.id === activeSessionId ? "text-foreground" : "text-inherit"}`}>{session.title}</strong><small className="mt-0.5 block text-[10px] text-muted-foreground">{session.ready_source_count} of {session.source_count} sources ready</small></span>
                    </Link>
                ))}
                {!visible.length && <p className="px-3 py-8 text-center text-xs text-muted-foreground">No matching sessions.</p>}
            </nav>
        </aside>
    );
};

export default KnowledgeSessionRail;
