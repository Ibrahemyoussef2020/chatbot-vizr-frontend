import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setReplyText, sendThreadReply } from "@/redux/inboxSlice";
import type { AIProvider } from "@/services/llms/aiGateway";

export interface ComposerProps {
    quickTemplates: string[];
    aiProvider: AIProvider;
    onAIProviderChange: (provider: AIProvider) => void;
    isAILoading: boolean;
    onAISuggestReply: () => void;
}

export const Composer = ({
    quickTemplates,
    aiProvider,
    onAIProviderChange,
    isAILoading,
    onAISuggestReply,
}: ComposerProps) => {
    const dispatch = useAppDispatch();
    const { selectedThread, replyText, sendingReply, messages } = useAppSelector((state) => state.inbox);

    const handleSendReply = () => {
        if (!replyText.trim() || !selectedThread) return;
        void dispatch(
            sendThreadReply({
                threadId: selectedThread.id,
                content: replyText.trim(),
                senderName: "Support Agent",
            })
        );
    };

    return (
        <div className="p-3 border-t border-border bg-card space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/60 pb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                    {quickTemplates.map((tmpl, i) => (
                        <Chip
                            key={i}
                            label={tmpl.slice(0, 25) + "..."}
                            onClick={() => dispatch(setReplyText(tmpl))}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: "0.68rem",
                                height: "22px",
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                                "&:hover": { bgcolor: "var(--accent)" },
                            }}
                        />
                    ))}
                </div>

                {/* Modular AI Gateway Integration */}
                <div className="flex items-center gap-1.5 ml-auto">
                    <Select
                        value={aiProvider}
                        onChange={(e) => onAIProviderChange(e.target.value as any)}
                        size="small"
                        sx={{
                            height: "24px",
                            fontSize: "0.68rem",
                            color: "var(--foreground)",
                            bgcolor: "var(--surface-muted)",
                            borderRadius: "6px",
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                        }}
                    >
                        <MenuItem value="vercel" sx={{ fontSize: "0.7rem" }}>⚡ Vercel Gateway</MenuItem>
                        <MenuItem value="custom" sx={{ fontSize: "0.7rem" }}>⚙️ Custom AI</MenuItem>
                    </Select>

                    <Button
                        size="small"
                        variant="outlined"
                        onClick={onAISuggestReply}
                        disabled={isAILoading || !messages.length}
                        sx={{
                            height: "24px",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            borderColor: "var(--primary)",
                            color: "var(--primary)",
                            borderRadius: "6px",
                            textTransform: "none",
                            gap: "4px",
                            "&:hover": { bgcolor: "var(--primary)/10" },
                        }}
                    >
                        {isAILoading ? (
                            <CircularProgress size={12} color="primary" />
                        ) : (
                            <>✨ AI Suggest Reply</>
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <TextField
                    multiline
                    maxRows={3}
                    fullWidth
                    placeholder="Type your message reply here..."
                    value={replyText}
                    onChange={(e) => dispatch(setReplyText(e.target.value))}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            fontSize: "0.78rem",
                            color: "var(--foreground)",
                            bgcolor: "var(--background)",
                            borderRadius: "8px",
                            "& fieldset": { borderColor: "var(--border)" },
                        },
                    }}
                />

                <Button
                    variant="contained"
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    sx={{
                        height: "38px",
                        minWidth: "44px",
                        bgcolor: "var(--primary)",
                        color: "#fff",
                        borderRadius: "8px",
                    }}
                >
                    {sendingReply ? <CircularProgress size={16} color="inherit" /> : <HiOutlinePaperAirplane className="text-base" />}
                </Button>
            </div>
        </div>
    );
};
