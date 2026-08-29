import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { HiOutlineTag, HiOutlinePlus } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setNewTagInput,
    setSelectedTagPreset,
    addTagToThread,
    removeTagFromThread,
} from "@/redux/inboxSlice";

export interface ConversationTagsProps {
    availableTagNames: string[];
}

export const ConversationTags = ({ availableTagNames }: ConversationTagsProps) => {
    const dispatch = useAppDispatch();
    const { selectedThread, selectedTagPreset, newTagInput } = useAppSelector((state) => state.inbox);

    if (!selectedThread) return null;

    const handleAddTag = (tagNameToAdd?: string) => {
        const targetTag = tagNameToAdd || newTagInput.trim();
        if (!targetTag || !selectedThread) return;
        dispatch(addTagToThread({ threadId: selectedThread.id, tag: targetTag }));
    };

    const handleRemoveTag = (tagToRemove: string) => {
        if (!selectedThread) return;
        dispatch(removeTagFromThread({ threadId: selectedThread.id, tag: tagToRemove }));
    };

    return (
        <div className="border-t border-border pt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                    <HiOutlineTag className="text-primary" /> Conversation Tags
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">
                    {selectedThread.tags?.length || 0} Tags
                </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {selectedThread.tags?.map((t) => (
                    <Chip
                        key={t}
                        label={t}
                        onDelete={() => handleRemoveTag(t)}
                        size="small"
                        sx={{
                            fontSize: "0.68rem",
                            height: "24px",
                            bgcolor: "var(--primary)/15",
                            color: "var(--primary)",
                            fontWeight: 700,
                        }}
                    />
                ))}
                {!selectedThread.tags?.length && (
                    <span className="text-[11px] text-muted-foreground italic">No tags added yet.</span>
                )}
            </div>

            <div className="space-y-1.5 pt-1">
                <Select
                    value={selectedTagPreset}
                    onChange={(e) => {
                        const val = e.target.value;
                        dispatch(setSelectedTagPreset(val));
                        if (val) handleAddTag(val);
                    }}
                    displayEmpty
                    size="small"
                    fullWidth
                    sx={{
                        height: "30px",
                        fontSize: "0.72rem",
                        color: "var(--foreground)",
                        bgcolor: "var(--card)",
                        borderRadius: "6px",
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                    }}
                >
                    <MenuItem value="" disabled sx={{ fontSize: "0.72rem" }}>
                        Select Tag from Endpoint...
                    </MenuItem>
                    {availableTagNames.map((tagName) => (
                        <MenuItem key={tagName} value={tagName} sx={{ fontSize: "0.72rem" }}>
                            🏷️ {tagName}
                        </MenuItem>
                    ))}
                </Select>

                <div className="flex items-center gap-1.5">
                    <input
                        type="text"
                        placeholder="Or type custom tag text..."
                        value={newTagInput}
                        onChange={(e) => dispatch(setNewTagInput(e.target.value))}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        className="flex-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                        onClick={() => handleAddTag()}
                        className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-sm hover:bg-primary/90"
                    >
                        <HiOutlinePlus />
                    </button>
                </div>
            </div>
        </div>
    );
};
