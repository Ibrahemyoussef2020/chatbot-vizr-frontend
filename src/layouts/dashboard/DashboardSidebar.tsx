import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
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
    HiOutlineArrowUpTray,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineRectangleStack,
    HiOutlineClipboardDocumentList,
    HiOutlinePresentationChartLine,
    HiOutlineBookmark,
    HiOutlineCpuChip,
    HiOutlineServerStack,
    HiOutlineSparkles,
    HiOutlineArrowsRightLeft,
    HiOutlineChartPie,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineCheck,
    HiOutlineXMark,
} from "react-icons/hi2";
import type { IconType } from "react-icons";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { logoutAsync } from "@/redux/authThunk";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import { workspaceServices } from "@/services";
import type { Workspace } from "@/services/core/workspace";
import { setActiveWorkspace } from "@/redux/workspaceSlice";

interface DashboardSidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

interface NavigationItem {
    permission?: string;
    label: string;
    to: string;
    icon: IconType;
    end?: boolean;
}

const navigationSections: { label: string; businessOnly?: boolean; items: NavigationItem[] }[] = [
    {
        label: "Workspace",
        items: [
            { label: "Dashboard", to: "/dashboard", icon: HiOutlineHome, end: true },
            { label: "Analytics", to: "/dashboard/analytics", icon: HiOutlineChartBarSquare },
            { label: "Inbox", to: "/dashboard/inbox", icon: HiOutlineChatBubbleLeftRight },
            { label: "Tags", to: "/dashboard/tags", icon: HiOutlineTag },
        ],
    },
    {
        label: "AI Management",
        items: [
            { label: "Overview", to: "/dashboard/ai-management/overview", icon: HiOutlineChartBarSquare },
            { label: "Providers", to: "/dashboard/ai-management/providers", icon: HiOutlineServerStack },
            { label: "Models", to: "/dashboard/ai-management/models", icon: HiOutlineCpuChip },
            { label: "Agents", to: "/dashboard/ai-management/agents", icon: HiOutlineSparkles },
            { label: "Routing", to: "/dashboard/ai-management/routing", icon: HiOutlineArrowsRightLeft },
            { label: "Quotas", to: "/dashboard/ai-management/quotas", icon: HiOutlineChartPie },
            { label: "Request Logs", to: "/dashboard/ai-management/request-logs", icon: HiOutlineQueueList },
        ],
    },
    {
        label: "Knowledge Base",
        businessOnly: true,
        items: [
            { label: "Upload files", to: "/dashboard/knowledge/upload", icon: HiOutlineArrowUpTray },
            { label: "Knowledge chat", to: "/dashboard/knowledge/chat", icon: HiOutlineChatBubbleBottomCenterText },
            { label: "Knowledge sessions", to: "/dashboard/knowledge", icon: HiOutlineRectangleStack, end: true },
            { label: "Plans", to: "/dashboard/knowledge/plans", icon: HiOutlineClipboardDocumentList },
            { label: "Reports", to: "/dashboard/knowledge/reports", icon: HiOutlinePresentationChartLine },
            { label: "Saved", to: "/dashboard/knowledge/saved", icon: HiOutlineBookmark },
        ],
    },
    {
        label: "Payment",
        items: [
            { label: "Pricings", to: "/dashboard/business/pricings", icon: HiOutlineClipboardDocumentList, permission: "plans.manage" },
            { label: "Pricings Features", to: "/dashboard/business/pricings-features", icon: HiOutlineRectangleStack, permission: "plans.manage" },
            { label: "Payments", to: "/dashboard/business/payments", icon: HiOutlineQueueList, permission: "payments.view" },
            { label: "Payment Methods", to: "/dashboard/business/payment-methods", icon: HiOutlineCog6Tooth, permission: "payment_methods.manage" },
            { label: "Subscriptions", to: "/dashboard/business/subscriptions", icon: HiOutlineRectangleStack, permission: "subscriptions.view" },
        ],
    },
    {
        label: "Administration",
        items: [
            { label: "System logs", to: "/dashboard/logs", icon: HiOutlineQueueList },
            { label: "Settings", to: "/dashboard/settings", icon: HiOutlineCog6Tooth },
        ],
    },
];

interface SidebarContentProps {
    onClose: () => void;
    onCreateWorkspace: () => void;
    onManageWorkspaces: () => void;
    onLogout: () => void;
    canCreateWorkspace: boolean;
    canAccessBusinessTools: boolean;
}

const SidebarContent = ({ onClose, onCreateWorkspace, onManageWorkspaces, onLogout, canCreateWorkspace, canAccessBusinessTools }: SidebarContentProps) => {
    const permissions = useAppSelector(state => state.auth.user?.permissions || []);
    return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-surface text-foreground">
        <NavLink className="flex items-center gap-3 border-b border-border px-6 py-5 no-underline" to="/" onClick={onClose}>
            <img className="h-9 w-9 object-contain" src="/robot.png" alt="Vizr" />
            <div>
                <strong className="block text-lg leading-5 text-foreground">Vizr AI</strong>
                <span className="text-[.62rem] font-bold uppercase tracking-[.16em] text-muted-foreground">Workspace</span>
            </div>
        </NavLink>

        <nav className="theme-scrollbar flex-1 overflow-y-auto px-4 py-5" aria-label="Dashboard navigation">
            <div className="space-y-6">
                {navigationSections
                    .filter(section => !section.businessOnly || canAccessBusinessTools)
                    .filter(section => section.items.some(item => !item.permission || permissions.includes(item.permission)))
                    .map(section => (
                        <section key={section.label} aria-label={section.label}>
                            <h2 className="mb-2 mt-0 px-3 text-[.62rem] font-extrabold uppercase tracking-[.14em] text-muted-foreground">
                                {section.label}
                            </h2>
                            <div className="grid gap-1">
                                {section.items.filter(item => !item.permission || permissions.includes(item.permission)).map(({ label, to, icon: Icon, end }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold no-underline transition-colors ${
                                                isActive
                                                    ? "bg-primary/15 text-primary"
                                                    : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                            }`
                                        }
                                    >
                                        <Icon className="text-lg" aria-hidden="true" />
                                        {label}
                                    </NavLink>
                                ))}
                            </div>
                        </section>
                    ))}
            </div>
        </nav>

        <div className="grid gap-2 border-t border-border bg-surface-muted p-4">
            {canCreateWorkspace && (
                <Button startIcon={<HiOutlinePlus />} variant="contained" onClick={onCreateWorkspace} className="!bg-primary !font-bold">
                    New Workspace
                </Button>
            )}
            {canCreateWorkspace && (
                <Button startIcon={<HiOutlinePencilSquare />} onClick={onManageWorkspaces} className="!justify-start">
                    Manage Workspaces
                </Button>
            )}
            <Button className="!justify-start" color="error" startIcon={<HiOutlineArrowRightStartOnRectangle />} onClick={onLogout}>
                Log Out
            </Button>
        </div>
    </div>
    );
};

const DashboardSidebar = ({ mobileOpen, onClose }: DashboardSidebarProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const role = useAppSelector((state) => state.auth.user?.role);
    const canCreateWorkspace = role === "super_admin";
    const canAccessBusinessTools = role === "super_admin" || role === "admin";
    const [createOpen, setCreateOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [savingWorkspace, setSavingWorkspace] = useState(false);
    const [deletingWorkspaceId, setDeletingWorkspaceId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
    const [workspaceName, setWorkspaceName] = useState("");
    const [workspaceRateLimit, setWorkspaceRateLimit] = useState("60");
    const [workspaceActive, setWorkspaceActive] = useState(true);
    const { items: workspaces, active: activeWorkspace } = useAppSelector((state) => state.workspace);

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

    const manageWorkspaces = async () => {
        setError("");
        try {
            await dispatch(fetchWorkspaces()).unwrap();
            setManageOpen(true);
        } catch {
            setError("Workspaces could not be loaded.");
        }
    };

    const startEditingWorkspace = (workspace: Workspace) => {
        setEditingWorkspace(workspace);
        setWorkspaceName(workspace.name);
        setWorkspaceRateLimit(String(workspace.rate_limit));
        setWorkspaceActive(workspace.is_active);
        setError("");
    };

    const saveWorkspace = async () => {
        if (!editingWorkspace || !workspaceName.trim()) return;
        setSavingWorkspace(true);
        setError("");
        try {
            await workspaceServices.updateWorkspace(editingWorkspace.id, {
                name: workspaceName.trim(),
                rate_limit: Number(workspaceRateLimit),
                is_active: workspaceActive,
            });
            await dispatch(fetchWorkspaces()).unwrap();
            setEditingWorkspace(null);
        } catch (requestError: any) {
            setError(requestError?.response?.data?.message || "Workspace could not be updated.");
        } finally {
            setSavingWorkspace(false);
        }
    };

    const deactivateWorkspace = async (workspace: Workspace) => {
        if (!window.confirm(`Deactivate “${workspace.name}”? Its data and settings will be retained.`)) return;
        setDeletingWorkspaceId(workspace.id);
        setError("");
        try {
            await workspaceServices.deleteWorkspace(workspace.id);
            const refreshed = await dispatch(fetchWorkspaces()).unwrap();
            if (activeWorkspace?.id === workspace.id) {
                dispatch(setActiveWorkspace(refreshed.find((item) => item.is_active) || {
                    id: "all", name: "All Workspaces (Global)", slug: "all", is_active: true, rate_limit: 60,
                }));
            }
        } catch (requestError: any) {
            setError(requestError?.response?.data?.message || "Workspace could not be deactivated.");
        } finally {
            setDeletingWorkspaceId(null);
        }
    };

    const contentProps = {
        onClose,
        onCreateWorkspace: () => setCreateOpen(true),
        onManageWorkspaces: () => void manageWorkspaces(),
        onLogout: logout,
        canCreateWorkspace,
        canAccessBusinessTools,
    };

    return (
        <>
            <aside className="hidden h-screen w-72 shrink-0 xl:block">
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
            <Dialog open={manageOpen} onClose={() => { setManageOpen(false); setEditingWorkspace(null); setError(""); }} fullWidth maxWidth="md">
                <DialogTitle>Manage workspaces</DialogTitle>
                <DialogContent className="!grid !gap-3 !pt-2">
                    <p className="m-0 text-sm text-muted-foreground">Edit workspace details or deactivate a workspace. Deactivation retains its data and credentials.</p>
                    {error && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}
                    <div className="grid gap-2">
                        {workspaces.map((workspace) => (
                            <div key={workspace.id} className="grid grid-cols-1 items-center gap-3 rounded-xl border border-border p-3 md:grid-cols-[1fr_auto]">
                                {editingWorkspace?.id === workspace.id ? (
                                    <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_130px_130px]">
                                        <TextField size="small" label="Workspace name" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} slotProps={{ htmlInput: { maxLength: 255 } }} />
                                        <TextField size="small" type="number" label="Rate limit" value={workspaceRateLimit} onChange={(event) => setWorkspaceRateLimit(event.target.value)} slotProps={{ htmlInput: { min: 1, max: 1000 } }} />
                                        <TextField select size="small" label="Status" value={workspaceActive ? "active" : "inactive"} onChange={(event) => setWorkspaceActive(event.target.value === "active")}>
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                        </TextField>
                                    </div>
                                ) : (
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <strong className="truncate text-sm">{workspace.name}</strong>
                                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${workspace.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                                                {workspace.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className="m-0 mt-1 truncate text-xs text-muted-foreground">{workspace.slug} · rate limit {workspace.rate_limit}</p>
                                    </div>
                                )}
                                <div className="flex justify-end gap-1">
                                    {editingWorkspace?.id === workspace.id ? (
                                        <>
                                            <Button size="small" startIcon={<HiOutlineCheck />} onClick={() => void saveWorkspace()} disabled={savingWorkspace || !workspaceName.trim()}>Save</Button>
                                            <Button size="small" startIcon={<HiOutlineXMark />} onClick={() => setEditingWorkspace(null)} disabled={savingWorkspace}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="small" startIcon={<HiOutlinePencilSquare />} onClick={() => startEditingWorkspace(workspace)}>Edit</Button>
                                            {workspace.is_active && <Button size="small" color="error" startIcon={<HiOutlineTrash />} onClick={() => void deactivateWorkspace(workspace)} disabled={deletingWorkspaceId === workspace.id}>Deactivate</Button>}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        {!workspaces.length && <p className="m-0 py-6 text-center text-sm text-muted-foreground">No workspaces found.</p>}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setManageOpen(false); setEditingWorkspace(null); setError(""); }}>Done</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DashboardSidebar;
