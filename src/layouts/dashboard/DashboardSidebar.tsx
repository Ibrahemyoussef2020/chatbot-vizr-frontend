import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    HiOutlineChatBubbleLeftRight,
    HiOutlineChartBarSquare,
    HiOutlineCog6Tooth,
    HiOutlineHome,
    HiOutlineQueueList,
    HiOutlineTag,
    HiOutlineArrowRightStartOnRectangle,
    HiOutlinePlus,
} from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logoutAsync } from "@/redux/authThunk";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import { workspaceServices } from "@/services";

interface DashboardSidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { label: "Dashboard", to: "/dashboard", icon: HiOutlineHome, end: true },
    { label: "Analytics", to: "/dashboard/analytics", icon: HiOutlineChartBarSquare },
    { label: "Inbox", to: "/dashboard/inbox", icon: HiOutlineChatBubbleLeftRight },
    { label: "Tags", to: "/dashboard/tags", icon: HiOutlineTag },
    { label: "Token management", to: "/dashboard/token-management", icon: HiOutlineChartBarSquare },
    { label: "System logs", to: "/dashboard/logs", icon: HiOutlineQueueList },
    { label: "Settings", to: "/dashboard/settings", icon: HiOutlineCog6Tooth },
];

interface SidebarContentProps {
    onClose: () => void;
    onCreateWorkspace: () => void;
    onLogout: () => void;
    canCreateWorkspace: boolean;
}

const SidebarContent = ({ onClose, onCreateWorkspace, onLogout, canCreateWorkspace }: SidebarContentProps) => (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface text-foreground">
        <NavLink className="flex items-center gap-3 border-b border-border px-6 py-5 no-underline" to="/" onClick={onClose}>
            <img className="h-9 w-9 object-contain" src="/robot.png" alt="Vizr" />
            <div>
                <strong className="block text-lg leading-5 text-foreground">Vizr AI</strong>
                <span className="text-[.62rem] font-bold uppercase tracking-[.16em] text-muted-foreground">Workspace</span>
            </div>
        </NavLink>

        <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Dashboard navigation">
            <p className="mb-2 px-3 text-[.62rem] font-extrabold uppercase tracking-[.14em] text-muted-foreground">Navigation</p>
            <div className="grid gap-1">
                {navigation.map(({ label, to, icon: Icon, end }) => (
                    <NavLink
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors ${
                                isActive
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                            }`
                        }
                        end={end}
                        key={to}
                        to={to}
                        onClick={onClose}
                    >
                        <Icon className="text-xl" aria-hidden="true" />
                        {label}
                    </NavLink>
                ))}
            </div>
        </nav>

        <div className="grid gap-2 border-t border-border bg-surface-muted p-4">
            {canCreateWorkspace && (
                <Button startIcon={<HiOutlinePlus />} variant="contained" onClick={onCreateWorkspace} className="!bg-primary !font-bold">
                    New Workspace
                </Button>
            )}
            <Button className="!justify-start" color="error" startIcon={<HiOutlineArrowRightStartOnRectangle />} onClick={onLogout}>
                Log Out
            </Button>
        </div>
    </div>
);

const DashboardSidebar = ({ mobileOpen, onClose }: DashboardSidebarProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const role = useAppSelector((state) => state.auth.user?.role);
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const logout = async () => {
        await dispatch(logoutAsync());
        onClose();
        navigate("/");
    };

    const createWorkspace = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = String(new FormData(form).get("name") || "").trim();
        if (!name) return;

        setCreating(true);
        setError("");

        try {
            await workspaceServices.createWorkspace(name);
            await dispatch(fetchWorkspaces()).unwrap();
            setCreateOpen(false);
            form.reset();
            onClose();
        } catch {
            setError("Workspace could not be created.");
        } finally {
            setCreating(false);
        }
    };

    const contentProps = {
        onClose,
        onCreateWorkspace: () => setCreateOpen(true),
        onLogout: logout,
        canCreateWorkspace: role === "super_admin",
    };

    return (
        <>
            <aside className="hidden h-screen w-64 shrink-0 xl:block">
                <SidebarContent {...contentProps} />
            </aside>
            <Drawer open={mobileOpen} onClose={onClose}>
                <SidebarContent {...contentProps} />
            </Drawer>
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
                <form onSubmit={createWorkspace}>
                    <DialogTitle>Create workspace</DialogTitle>
                    <DialogContent className="!grid !gap-3 !pt-2">
                        <p className="m-0 text-sm text-muted-foreground">Create an isolated workspace for its conversations, users, and configuration.</p>
                        <TextField autoFocus name="name" label="Workspace name" required slotProps={{ htmlInput: { maxLength: 255 } }} />
                        {error && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={creating}>{creating ? "Creating…" : "Create"}</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};

export default DashboardSidebar;
