import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updatePriority, assignAgentToThread } from "@/redux/inboxSlice";
import type { FilterThreadsParams } from "@/services/inbox";

export interface AgentOption {
    id: string;
    name: string;
    email: string;
}

export interface TicketDetailsProps {
    agentOptions: AgentOption[];
    filterParams: FilterThreadsParams;
}

export const TicketDetails = ({ agentOptions, filterParams }: TicketDetailsProps) => {
    const dispatch = useAppDispatch();
    const { selectedThread } = useAppSelector((state) => state.inbox);

    if (!selectedThread) return null;

    const handleChangePriority = (newPriority: string) => {
        dispatch(
            updatePriority({
                threadId: selectedThread.id,
                priority: newPriority,
                filterParams,
            })
        );
    };

    const handleAssignAgent = (agentId: string) => {
        const agent = agentOptions.find((a) => a.id === agentId);
        if (!agent) return;

        dispatch(
            assignAgentToThread({
                threadId: selectedThread.id,
                agentId: agent.id,
                agentName: agent.name,
                agentEmail: agent.email,
                filterParams,
            })
        );
    };

    return (
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Priority
                </span>
                <Select
                    value={selectedThread.priority || "medium"}
                    onChange={(e) => handleChangePriority(e.target.value)}
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
                    <MenuItem value="high" sx={{ fontSize: "0.72rem" }}>🔴 HIGH</MenuItem>
                    <MenuItem value="medium" sx={{ fontSize: "0.72rem" }}>🟡 MEDIUM</MenuItem>
                    <MenuItem value="low" sx={{ fontSize: "0.72rem" }}>🔵 LOW</MenuItem>
                </Select>
            </div>

            <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                    Agent
                </span>
                <Select
                    value={selectedThread.assigned_agent?.id || "unassigned"}
                    onChange={(e) => handleAssignAgent(e.target.value)}
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
                    {agentOptions.map((agent) => (
                        <MenuItem key={agent.id} value={agent.id} sx={{ fontSize: "0.72rem" }}>
                            <HiOutlineUserPlus className="mr-1 inline text-primary" /> {agent.name.split(" ")[0]}
                        </MenuItem>
                    ))}
                </Select>
            </div>
        </div>
    );
};
