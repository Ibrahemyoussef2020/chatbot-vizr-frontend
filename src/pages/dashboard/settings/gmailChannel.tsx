import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    HiOutlineArrowPath,
    HiOutlineCheckCircle,
    HiOutlineEnvelope,
    HiOutlineInformationCircle,
    HiOutlineLink,
    HiOutlinePaperAirplane,
    HiOutlineTrash,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    disconnectGmail,
    fetchGmailStatus,
    renewGmailWatch,
    sendGmailTestMessage,
    startGmailConnection,
    type GmailStatus,
} from "@/services/integrations/gmail";

const primaryButtonSx = {
    borderRadius: "10px",
    fontWeight: 800,
    textTransform: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    "&:hover": { backgroundColor: "#b91c1c" },
    "&.Mui-disabled": { backgroundColor: "#334155", color: "#cbd5e1", opacity: 0.78 },
};

const outlineButtonSx = {
    borderRadius: "9px",
    fontWeight: 700,
    textTransform: "none",
    borderColor: "#ef4444",
    color: "#f87171",
    backgroundColor: "transparent",
    "&:hover": { borderColor: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.12)" },
    "&.Mui-disabled": { borderColor: "#475569", color: "#94a3b8" },
};

const emptyStatus: GmailStatus = { connected: false, status: "disconnected" };

const GmailChannel = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);
    const [searchParams, setSearchParams] = useSearchParams();
    const [status, setStatus] = useState<GmailStatus>(emptyStatus);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("Vizr Gmail integration test");
    const [content, setContent] = useState("Hello! This is a test message from your Vizr omnichannel inbox.");

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            setStatus(await fetchGmailStatus(activeWorkspace?.slug));
            setError("");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load Gmail connection status.");
        } finally {
            setLoading(false);
        }
    }, [activeWorkspace?.slug]);

    useEffect(() => { void reload(); }, [reload]);

    useEffect(() => {
        if (searchParams.get("connected") === "1") {
            setSuccess("Gmail connected and mailbox watch registered successfully.");
            const next = new URLSearchParams(searchParams);
            next.delete("connected");
            setSearchParams(next, { replace: true });
            return;
        }
        const oauthError = searchParams.get("error");
        if (oauthError) {
            setError(`Gmail connection failed: ${oauthError}`);
            const next = new URLSearchParams(searchParams);
            next.delete("error");
            setSearchParams(next, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const canSend = useMemo(
        () => /^\S+@\S+\.\S+$/.test(recipient.trim()) && Boolean(subject.trim() && content.trim()),
        [recipient, subject, content],
    );

    const connect = async () => {
        if (working) return;
        setWorking(true);
        setError("");
        try {
            const authorizationUrl = await startGmailConnection(activeWorkspace?.slug);
            window.location.assign(authorizationUrl);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Unable to start Google authorization.");
            setWorking(false);
        }
    };

    const renew = async () => {
        setWorking(true);
        setError("");
        try {
            await renewGmailWatch(activeWorkspace?.slug);
            setSuccess("Gmail mailbox watch renewed successfully.");
            await reload();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Unable to renew Gmail mailbox watch.");
        } finally {
            setWorking(false);
        }
    };

    const remove = async () => {
        if (!confirm("Disconnect this Gmail account from the workspace?")) return;
        setWorking(true);
        setError("");
        try {
            await disconnectGmail(activeWorkspace?.slug);
            setStatus(emptyStatus);
            setSuccess("Gmail disconnected.");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Unable to disconnect Gmail.");
        } finally {
            setWorking(false);
        }
    };

    const sendTest = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSend) return;
        setSending(true);
        setError("");
        setSuccess("");
        try {
            const result = await sendGmailTestMessage(
                activeWorkspace?.slug,
                recipient.trim(),
                subject.trim(),
                content.trim(),
            );
            setSuccess(`Test email sent to ${result.recipient}.`);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Unable to send Gmail test message.");
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><CircularProgress size={36} /></div>;

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <HiOutlineEnvelope className="text-2xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">Gmail Integration Manager</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">OAuth connection, mailbox notifications, Inbox routing, and test email delivery.</p>
                    </div>
                </div>
                <Button variant="outlined" startIcon={<HiOutlineArrowPath />} onClick={() => void reload()} sx={outlineButtonSx}>Refresh status</Button>
            </header>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success" icon={<HiOutlineCheckCircle />}>{success}</Alert>}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-7">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Google account connection</h3>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${status.connected ? "bg-emerald-500/15 text-emerald-500" : status.status === "error" ? "bg-red-500/15 text-red-500" : "bg-slate-500/15 text-muted-foreground"}`}>
                            {status.status}
                        </span>
                    </div>

                    {status.connected ? (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Connected mailbox</div>
                                <div className="mt-1 font-bold text-foreground">{status.email}</div>
                                <div className="mt-2 text-[11px] text-muted-foreground">
                                    Watch expires: {status.watch_expiration ? new Date(status.watch_expiration).toLocaleString() : "Not available"}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button disabled={working} variant="outlined" startIcon={<HiOutlineArrowPath />} onClick={renew} sx={outlineButtonSx}>Renew mailbox watch</Button>
                                <Button disabled={working} variant="outlined" startIcon={<HiOutlineTrash />} onClick={remove} sx={{ ...outlineButtonSx, borderColor: "#ef4444", color: "#f87171" }}>Disconnect Gmail</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs leading-relaxed text-muted-foreground">
                                Connect Gmail once. Google will return to the configured callback, then the backend stores the refresh token and starts the mailbox watch automatically.
                            </div>
                            <Button aria-disabled={working} variant="contained" startIcon={working ? <CircularProgress size={16} color="inherit" /> : <HiOutlineLink />} onClick={connect} sx={primaryButtonSx}>
                                {working ? "Opening Google..." : "Connect Gmail with Google"}
                            </Button>
                        </div>
                    )}

                    {status.error_message && <Alert severity="warning">{status.error_message}</Alert>}

                    <div className="rounded-xl border border-border bg-surface-muted/40 p-4 text-xs text-muted-foreground">
                        <div className="mb-2 flex items-center gap-2 font-extrabold uppercase tracking-wider text-red-400"><HiOutlineInformationCircle /> Message flow</div>
                        Incoming Gmail → Pub/Sub webhook → Inbox conversation → AI or human strategy → reply in the same Gmail thread.
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-5">
                    <h3 className="flex items-center gap-2 border-b border-border pb-3 text-xs font-extrabold uppercase tracking-wider text-red-400">
                        <HiOutlinePaperAirplane className="text-lg" /> Gmail test message
                    </h3>
                    <form onSubmit={sendTest} className="mt-4 space-y-3">
                        <Field label="Recipient email">
                            <input type="email" required value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="recipient@example.com" className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground outline-none focus:border-red-500" />
                        </Field>
                        <Field label="Subject">
                            <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground outline-none focus:border-red-500" />
                        </Field>
                        <Field label="Message">
                            <textarea rows={5} required value={content} onChange={(e) => setContent(e.target.value)} className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs text-foreground outline-none focus:border-red-500" />
                        </Field>
                        <Button type="submit" fullWidth disabled={sending || !canSend} variant="contained" startIcon={<HiOutlinePaperAirplane />} sx={primaryButtonSx}>
                            {sending ? "Sending..." : "Send Gmail test message"}
                        </Button>
                        {!status.connected && <p className="text-[10px] font-semibold text-warning">Complete the fields to enable the test button. Gmail must be connected before the backend can deliver the message.</p>}
                    </form>
                </section>
            </div>
        </div>
    );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
        <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</span>
        {children}
    </label>
);

export default GmailChannel;
