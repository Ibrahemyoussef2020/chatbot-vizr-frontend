import Button from "@mui/material/Button";
import { HiOutlineChatBubbleBottomCenterText, HiOutlineTrash } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setNewNoteInput,
    addInternalNoteToThread,
    deleteInternalNoteFromThread,
} from "@/redux/inboxSlice";

export interface InternalNotesProps {
    formatDate: (date?: string) => string;
}

export const InternalNotes = ({ formatDate }: InternalNotesProps) => {
    const dispatch = useAppDispatch();
    const { selectedThread, newNoteInput, savingSidebar } = useAppSelector((state) => state.inbox);

    if (!selectedThread) return null;

    const handleAddNote = () => {
        if (!newNoteInput.trim() || !selectedThread) return;
        dispatch(
            addInternalNoteToThread({
                threadId: selectedThread.id,
                content: newNoteInput.trim(),
                author: "Support Agent",
            })
        );
    };

    const handleDeleteNote = (noteId: string) => {
        if (!selectedThread) return;
        dispatch(
            deleteInternalNoteFromThread({
                threadId: selectedThread.id,
                noteId,
            })
        );
    };

    return (
        <div className="border-t border-border pt-3 space-y-2 text-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <HiOutlineChatBubbleBottomCenterText className="text-warning text-sm" /> Internal Team Notes
                </span>
                <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-warning">
                    Private to Team
                </span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {selectedThread.notes?.map((n) => (
                    <div key={n.id} className="rounded-xl border border-border bg-surface-muted/50 p-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-bold text-foreground">{n.author}</span>
                            <div className="flex items-center gap-1">
                                <span>{formatDate(n.created_at)}</span>
                                <button
                                    onClick={() => handleDeleteNote(n.id)}
                                    className="text-danger hover:opacity-80 ml-1"
                                >
                                    <HiOutlineTrash className="text-xs" />
                                </button>
                            </div>
                        </div>
                        <p className="m-0 text-xs text-foreground font-medium">{n.content}</p>
                    </div>
                ))}
                {!selectedThread.notes?.length && (
                    <div className="p-3 text-center text-[11px] text-muted-foreground italic border border-dashed border-border rounded-xl">
                        No internal notes written yet. Notes are private and invisible to visitors.
                    </div>
                )}
            </div>

            <div className="pt-2 space-y-1.5">
                <textarea
                    rows={2}
                    placeholder="Add an internal note for your support team..."
                    value={newNoteInput}
                    onChange={(e) => dispatch(setNewNoteInput(e.target.value))}
                    className="w-full rounded-lg border border-border bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <Button
                    size="small"
                    variant="contained"
                    onClick={handleAddNote}
                    disabled={savingSidebar || !newNoteInput.trim()}
                    sx={{
                        height: "28px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "none",
                        bgcolor: "var(--warning)",
                        color: "#000",
                        borderRadius: "6px",
                        width: "100%",
                        "&:hover": { bgcolor: "var(--warning)" },
                    }}
                >
                    Post Internal Team Note
                </Button>
            </div>
        </div>
    );
};
