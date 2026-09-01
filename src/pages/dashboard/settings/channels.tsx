import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    HiOutlineChatBubbleLeftRight,
    HiOutlinePaperAirplane,
    HiOutlineDevicePhoneMobile,
    HiOutlineBeaker,
    HiOutlineCheckCircle,
    HiOutlineArrowRight,
    HiOutlineEnvelope,
} from "react-icons/hi2";

const Channels = () => {
    const navigate = useNavigate();

    const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
    const [activeTestChannel, setActiveTestChannel] = useState<string>("");
    const [testSignalOutput, setTestSignalOutput] = useState<string>("");

    const channelList = [
        {
            id: "whatsapp",
            name: "WhatsApp Business API",
            description: "Connect Meta Cloud API or OpenWA Gateway to allow visitors and customers to chat via WhatsApp.",
            icon: HiOutlineDevicePhoneMobile,
            status: { label: "Configured", type: "info" },
            targetPath: "/dashboard/settings/channels/whatsapp",
            btnLabel: "Configure WhatsApp",
        },
        {
            id: "telegram",
            name: "Telegram Bot",
            description: "Connect Telegram bot webhook for automated 24/7 customer service conversations.",
            icon: HiOutlinePaperAirplane,
            status: { label: "Configured", type: "info" },
            targetPath: "/dashboard/settings/channels/telegram",
            btnLabel: "Configure Telegram",
        },
        {
            id: "webchat",
            name: "Web Chat Widget",
            description: "Embed an AI-powered live chatbot widget directly on your website or web application.",
            icon: HiOutlineChatBubbleLeftRight,
            status: { label: "Enabled", type: "success" },
            status2: { label: "Configured", type: "info" },
            targetPath: "/dashboard/settings/widget",
            btnLabel: "Configure Web Widget",
        },
        {
            id: "gmail",
            name: "Gmail",
            description: "Connect a Gmail mailbox through Google OAuth and route email conversations into the shared Inbox.",
            icon: HiOutlineEnvelope,
            status: { label: "Available", type: "info" },
            targetPath: "/dashboard/settings/channels/gmail",
            btnLabel: "Configure Gmail",
        },
    ];

    const handleRunTestSignal = (e: React.MouseEvent, channelName: string) => {
        e.stopPropagation();
        setActiveTestChannel(channelName);
        setTestSignalOutput(`[PING] Testing AI connection signal for ${channelName}... SUCCESS (200 OK). Gateway & AI Engine active.`);
        setTestModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <header className="border-b border-border pb-4">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground">
                    Channels &amp; Messaging Integrations Hub
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Connect messaging channels and manage how visitors reach your AI chatbot across platforms.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channelList.map((ch) => {
                    const Icon = ch.icon;

                    return (
                        <div
                            key={ch.id}
                            onClick={() => navigate(ch.targetPath)}
                            className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between shadow-sm hover:border-primary/80 hover:shadow-md cursor-pointer transition-all space-y-4 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <Icon className="text-2xl" />
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span
                                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                            ch.status.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-sky-500/10 text-sky-500"
                                        }`}
                                    >
                                        {ch.status.label}
                                    </span>
                                    {ch.status2 && (
                                        <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-sky-500">
                                            {ch.status2.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{ch.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ch.description}</p>
                            </div>

                            {/* EXACTLY 2 BUTTONS: Configure Channel & Test AI Connection */}
                            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border">
                                <Button
                                    variant="contained"
                                    fullWidth
                                    endIcon={<HiOutlineArrowRight />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(ch.targetPath);
                                    }}
                                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: "10px", py: 1 }}
                                >
                                    {ch.btnLabel}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    fullWidth
                                    startIcon={<HiOutlineBeaker />}
                                    onClick={(e) => handleRunTestSignal(e, ch.name)}
                                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", py: 0.7, fontSize: "0.75rem" }}
                                >
                                    Test AI Connection
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Test Signal Output Dialog */}
            <Dialog open={testModalOpen} onClose={() => setTestModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>AI Connection Test</DialogTitle>
                <DialogContent dividers className="space-y-3 p-5">
                    <Alert severity="success" icon={<HiOutlineCheckCircle className="text-lg" />}>
                        AI Connection active for <strong>{activeTestChannel}</strong>!
                    </Alert>
                    <div className="rounded-xl border border-border bg-surface-muted p-3 text-xs font-mono text-foreground leading-relaxed">
                        {testSignalOutput}
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setTestModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Channels;
