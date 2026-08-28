import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState, type FormEvent } from "react";
import * as chat from "@/services/chat";
import type { PublicMessage } from "@/services/chat";

const ChatPopup = () => {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(chat.restorePublicChat());
    const [messages, setMessages] = useState<PublicMessage[]>([]);
    const [loading, setLoading] = useState(Boolean(current));
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const closeButton = useRef<HTMLButtonElement>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const bottom = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!current) return;

        let active = true;

        chat.getPublicMessages(current.id, current.token)
            .then((data) => {
                if (active) setMessages(data.messages);
            })
            .catch(() => {
                if (!active) return;

                localStorage.removeItem("leadbot_public_chat");
                setCurrent(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [current]);

    useEffect(() => {
        if (!open) return;

        if (current) closeButton.current?.focus();
        else nameInput.current?.focus();
    }, [current, open]);

    useEffect(() => {
        bottom.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!open) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", closeOnEscape);

        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [open]);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const start = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        const form = new FormData(event.currentTarget);
        const name = String(form.get("name") || "").trim();
        const email = String(form.get("email") || "").trim();
        const phone = String(form.get("phone") || "").trim();

        try {
            const session = await chat.createPublicChat({ name, email, phone });
            setCurrent(session);
        } catch {
            setError("Please check your details and try again.");
        } finally {
            setLoading(false);
        }
    };

    const send = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!current || sending) return;

        const form = event.currentTarget;
        const content = String(new FormData(form).get("message") || "").trim();
        if (!content && !selectedFile) return;

        setSending(true);
        setError("");

        const attachments = selectedFile
            ? [
                  {
                      name: selectedFile.name,
                      url: URL.createObjectURL(selectedFile),
                      type: selectedFile.type || "file",
                      size: selectedFile.size,
                  },
              ]
            : undefined;

        try {
            const data = await chat.sendPublicMessage(
                current.id,
                current.token,
                content,
                attachments,
            );

            setMessages((items) => {
                const updated = [...items, data.message];
                if (data.reply) updated.push(data.reply);
                return updated;
            });

            form.reset();
            setSelectedFile(null);
        } catch {
            setError("Message could not be sent.");
        } finally {
            setSending(false);
        }
    };

    const end = async () => {
        if (!current) return;

        await chat.endPublicChat(current.id, current.token);
        setCurrent(null);
        setMessages([]);
        setSelectedFile(null);
    };

    return (
        <div className="fixed bottom-5 right-5 z-[1000]">
            <button
                className="float-right grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-primary bg-primary text-2xl text-primary-foreground shadow-[var(--shadow)] [&_img]:h-[85%] [&_img]:w-[85%] [&_img]:object-contain"
                aria-label={open ? "Close chat demo" : "Open chat demo"}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                {open ? "×" : <img src="/robot.png" alt="" />}
            </button>

            {open && (
                <section
                    className="absolute bottom-[4.5rem] right-0 grid h-[min(570px,calc(100vh_-_7rem))] w-[min(390px,calc(100vw_-_2rem))] grid-rows-[auto_1fr_auto_auto] overflow-hidden rounded-2xl border border-border bg-surface-elevated text-foreground shadow-[var(--shadow)]"
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="chat-title"
                >
                    <header className="flex items-center gap-3 bg-primary p-4 text-primary-foreground">
                        <img className="h-9 w-9 shrink-0 rounded-full bg-white p-1 object-contain" src="/robot.png" alt="" />
                        <div className="grid">
                            <strong id="chat-title">Vizr Assistant</strong>
                            <small className="flex items-center gap-2">
                                <i className="h-2 w-2 rounded-full bg-success" /> Online now
                            </small>
                        </div>
                        <button
                            className="ml-auto border-0 bg-transparent text-2xl text-inherit"
                            ref={closeButton}
                            aria-label="Close chat"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                    </header>

                    <div className="max-h-none overflow-y-auto p-4 space-y-3">
                        {loading && current && <p>Loading conversation…</p>}

                        {!current && (
                            <form className="grid gap-3 py-3" onSubmit={start}>
                                <div className="mb-2 text-center">
                                    <img className="mx-auto h-20 w-20 object-contain" src="/robott.png" alt="Vizr chatbot ready to help" />
                                    <strong className="mt-2 block text-lg">Welcome to Vizr</strong>
                                    <p className="mb-0 mt-1 text-sm leading-6 text-muted-foreground">
                                        Enter your name to start a live conversation with our AI assistant.
                                    </p>
                                </div>
                                <TextField inputRef={nameInput} name="name" label="Your name" required slotProps={{ htmlInput: { maxLength: 100 } }} />
                                <TextField name="email" label="Email (optional)" type="email" slotProps={{ htmlInput: { maxLength: 254 } }} />
                                <TextField name="phone" label="Phone number (optional)" type="tel" slotProps={{ htmlInput: { maxLength: 30 } }} />
                                <Button type="submit" variant="contained" disabled={loading}>
                                    {loading ? "Starting…" : "Start chatting"}
                                </Button>
                            </form>
                        )}

                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                    message.senderType === "visitor"
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "bg-surface-muted text-foreground"
                                }`}
                            >
                                <p className="mb-0">{message.content}</p>
                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {message.attachments.map((att, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 rounded-lg bg-black/10 px-2 py-1 text-xs"
                                            >
                                                <span>📎</span>
                                                <span className="truncate max-w-[180px]">{att.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {sending && (
                            <div className="bg-surface-muted w-fit rounded-2xl px-4 py-2 text-xs text-muted-foreground animate-pulse">
                                Vizr Assistant is typing…
                            </div>
                        )}

                        <div ref={bottom} />
                    </div>

                    {error && <p className="m-0 px-4 pb-3 text-sm text-danger" role="alert">{error}</p>}

                    {current && (
                        <div>
                            {selectedFile && (
                                <div className="flex items-center justify-between border-t border-border bg-surface-muted px-4 py-2 text-xs">
                                    <span className="truncate max-w-[240px]">📎 {selectedFile.name}</span>
                                    <button
                                        type="button"
                                        className="text-danger hover:underline"
                                        onClick={() => setSelectedFile(null)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            <form className="flex items-center gap-2 border-t border-border p-3" onSubmit={send}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedFile(e.target.files[0]);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="p-2 text-muted-foreground hover:text-foreground"
                                    title="Attach file"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    📎
                                </button>
                                <label className="sr-only" htmlFor="popup-message">Message</label>
                                <input
                                    className="min-w-0 flex-1 rounded-lg border border-input bg-background p-2.5 text-sm text-foreground"
                                    id="popup-message"
                                    name="message"
                                    maxLength={4000}
                                    placeholder="Message Vizr…"
                                    disabled={sending}
                                />
                                <Button type="submit" variant="contained" disabled={sending}>
                                    {sending ? "…" : "Send"}
                                </Button>
                            </form>
                            <button className="w-full border-0 bg-surface-muted p-2 text-xs text-muted-foreground hover:bg-surface-elevated" onClick={end}>
                                End this conversation
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default ChatPopup;
