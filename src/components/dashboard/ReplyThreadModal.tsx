import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Chip,
    Alert,
    CircularProgress,
} from "@mui/material";
import { HiOutlinePaperAirplane, HiOutlineXMark } from "react-icons/hi2";
import { replyToThread, type ThreadItem } from "@/services/analytics";

interface ReplyThreadModalProps {
    open: boolean;
    thread: ThreadItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

const quickTemplates = [
    "Hello! I am following up on your request. How can I assist you further today?",
    "Your order status has been updated. You will receive tracking updates shortly.",
    "Thank you for contacting support! Our engineering team is currently investigating this.",
    "We have processed your request. Please let us know if you need anything else!",
];

export const ReplyThreadModal: React.FC<ReplyThreadModalProps> = ({
    open,
    thread,
    onClose,
    onSuccess,
}) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!thread) return null;

    const handleSend = async () => {
        if (!content.trim()) return;

        setLoading(true);
        setError(null);

        try {
            await replyToThread(thread.id, content.trim(), "Support Agent");
            setContent("");
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string } } };
            setError(errorObj.response?.data?.message || "Failed to send reply. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        bgcolor: "var(--background)",
                        color: "var(--foreground)",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        p: 1,
                    },
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                }}
            >
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Reply to Thread: {thread.id}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--muted-foreground)" }}>
                        Visitor: {thread.user_name} ({thread.user_email || "No Email"})
                    </Typography>
                </Box>
                <Button
                    size="small"
                    onClick={onClose}
                    sx={{ color: "var(--muted-foreground)", minWidth: 0, p: 0.5 }}
                >
                    <HiOutlineXMark fontSize="1.2rem" />
                </Button>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: "var(--border)", py: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
                        {error}
                    </Alert>
                )}

                <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "var(--foreground)", fontWeight: 600 }}
                >
                    Quick Responses:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
                    {quickTemplates.map((template, idx) => (
                        <Chip
                            key={idx}
                            label={template.slice(0, 38) + "..."}
                            onClick={() => setContent(template)}
                            size="small"
                            variant="outlined"
                            sx={{
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                                "&:hover": {
                                    bgcolor: "var(--accent)",
                                },
                            }}
                        />
                    ))}
                </Box>

                <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Type your message reply here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            color: "var(--foreground)",
                            bgcolor: "var(--card)",
                            borderRadius: "10px",
                            "& fieldset": { borderColor: "var(--border)" },
                            "&:hover fieldset": { borderColor: "var(--primary)" },
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{ color: "var(--muted-foreground)" }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSend}
                    disabled={loading || !content.trim()}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <HiOutlinePaperAirplane />}
                    sx={{
                        bgcolor: "var(--primary)",
                        color: "#ffffff",
                        fontWeight: 600,
                        borderRadius: "8px",
                        textTransform: "none",
                        px: 3,
                    }}
                >
                    {loading ? "Sending..." : "Send Reply"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
