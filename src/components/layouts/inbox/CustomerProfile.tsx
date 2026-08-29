import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { HiOutlineUser, HiOutlinePencilSquare } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
    setEditingVisitor,
    setVisitorName,
    setVisitorEmail,
    setVisitorPhone,
    saveVisitorProfile,
} from "@/redux/inboxSlice";
import type { FilterThreadsParams } from "@/services/inbox";

export interface CustomerProfileProps {
    filterParams: FilterThreadsParams;
}

export const CustomerProfile = ({ filterParams }: CustomerProfileProps) => {
    const dispatch = useAppDispatch();
    const {
        selectedThread,
        editingVisitor,
        visitorName,
        visitorEmail,
        visitorPhone,
        savingSidebar,
    } = useAppSelector((state) => state.inbox);

    if (!selectedThread) return null;

    const handleSave = () => {
        dispatch(
            saveVisitorProfile({
                threadId: selectedThread.id,
                name: visitorName.trim(),
                email: visitorEmail.trim(),
                phone: visitorPhone.trim(),
                filterParams,
            })
        );
    };

    return (
        <div className="border-b border-border pb-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        <HiOutlineUser className="text-lg" />
                    </div>
                    <h3 className="m-0 text-sm font-black text-foreground">Customer Profile</h3>
                </div>

                <Tooltip title={editingVisitor ? "Cancel Edit" : "Edit Customer Info"}>
                    <button
                        onClick={() => dispatch(setEditingVisitor(!editingVisitor))}
                        className="p-1 text-muted-foreground hover:text-primary rounded-lg border border-border"
                    >
                        <HiOutlinePencilSquare className="text-base" />
                    </button>
                </Tooltip>
            </div>

            {editingVisitor ? (
                <div className="space-y-2 mt-3">
                    <input
                        type="text"
                        placeholder="Visitor Name"
                        value={visitorName}
                        onChange={(e) => dispatch(setVisitorName(e.target.value))}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                    />
                    <input
                        type="email"
                        placeholder="Visitor Email"
                        value={visitorEmail}
                        onChange={(e) => dispatch(setVisitorEmail(e.target.value))}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Visitor Phone"
                        value={visitorPhone}
                        onChange={(e) => dispatch(setVisitorPhone(e.target.value))}
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                    />
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleSave}
                        disabled={savingSidebar}
                        sx={{
                            height: "28px",
                            fontSize: "0.72rem",
                            bgcolor: "var(--primary)",
                            borderRadius: "6px",
                            width: "100%",
                            textTransform: "none",
                        }}
                    >
                        {savingSidebar ? "Saving..." : "Save Visitor Profile"}
                    </Button>
                </div>
            ) : (
                <div className="mt-2 space-y-1 text-xs">
                    <strong className="block text-foreground font-bold text-sm">{selectedThread.user_name}</strong>
                    <span className="block text-muted-foreground">{selectedThread.user_email || "No email provided"}</span>
                    {selectedThread.user_phone && (
                        <span className="block text-primary/80 font-mono text-[11px]">{selectedThread.user_phone}</span>
                    )}
                </div>
            )}
        </div>
    );
};
