import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import { useEffect, useState } from "react";
import {
    HiOutlineShieldCheck,
    HiOutlinePlus,
    HiOutlineMagnifyingGlass,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";
import {
    fetchSecurityRoles,
    fetchPermissions,
    saveSecurityRole,
    deleteSecurityRole,
    type SecurityRoleData,
    type PermissionData,
} from "@/services/securityRole";

const Security = () => {
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const [loading, setLoading] = useState<boolean>(true);
    const [roles, setRoles] = useState<SecurityRoleData[]>([]);
    const [permissions, setPermissions] = useState<PermissionData[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");

    // Modal state
    const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleNameInput, setRoleNameInput] = useState<string>("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [savingRole, setSavingRole] = useState<boolean>(false);

    const reloadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [rolesData, permsData] = await Promise.all([
                fetchSecurityRoles(activeWorkspace?.slug),
                fetchPermissions(),
            ]);
            setRoles(rolesData);
            setPermissions(permsData);
        } catch {
            setError("Failed to load security roles & capabilities.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        Promise.all([fetchSecurityRoles(activeWorkspace?.slug), fetchPermissions()])
            .then(([rolesData, permsData]) => {
                if (isMounted) {
                    setRoles(rolesData);
                    setPermissions(permsData);
                    setError("");
                }
            })
            .catch(() => {
                if (isMounted) setError("Failed to load security roles & capabilities.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeWorkspace]);

    const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleOpenRoleModal = (role?: SecurityRoleData) => {
        if (role) {
            setEditingRoleId(role.id);
            setRoleNameInput(role.name);
            setSelectedPermissions((role.permissions || []).map((p) => p.id));
        } else {
            setEditingRoleId(null);
            setRoleNameInput("");
            setSelectedPermissions([]);
        }
        setRoleModalOpen(true);
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingRole(true);
        setError("");

        try {
            await saveSecurityRole(
                {
                    name: roleNameInput,
                    selectedPermissions,
                },
                editingRoleId || undefined,
            );
            setRoleModalOpen(false);
            setSuccessMsg(editingRoleId ? "Security role updated successfully!" : "Security role created successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
            await reloadData();
        } catch {
            setError("Failed to save security role.");
        } finally {
            setSavingRole(false);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        try {
            await deleteSecurityRole(roleId);
            setSuccessMsg("Role deleted successfully!");
            setTimeout(() => setSuccessMsg(""), 3500);
            await reloadData();
        } catch {
            setError("Failed to delete security role.");
        }
    };

    const togglePermissionCheck = (permId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
        );
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <CircularProgress size={36} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="border-b border-border pb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
                        <HiOutlineShieldCheck className="text-primary text-xl" />
                        Security & Access Authorization
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage platform roles, assigned permissions, and system boundaries.
                    </p>
                </div>

                <Button
                    variant="contained"
                    startIcon={<HiOutlinePlus />}
                    onClick={() => handleOpenRoleModal()}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
                >
                    Create Role
                </Button>
            </header>

            {error && <Alert severity="error">{error}</Alert>}
            {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-500 text-xs font-bold">
                    <HiOutlineCheckCircle className="text-lg" />
                    {successMsg}
                </div>
            )}

            {/* Roles Table Card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        Security Roles ({filteredRoles.length})
                    </span>

                    <div className="relative min-w-[240px]">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search roles..."
                            className="w-full rounded-xl border border-border bg-surface-muted pl-9 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead className="bg-surface-muted uppercase font-bold text-muted-foreground">
                            <tr>
                                <th className="p-3">Role Designation</th>
                                <th className="p-3 text-center">Assigned Users</th>
                                <th className="p-3 text-center">Capabilities</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {filteredRoles.map((role) => (
                                <tr key={role.id} className="hover:bg-surface-muted/30 transition-colors">
                                    <td className="p-3">
                                        <div className="font-bold text-foreground">{role.name}</div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Scope: {role.system_id ? "Workspace Tenant" : "Global Platform"}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="rounded bg-surface-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
                                            {role.users_count || 0} Users
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                                            {(role.permissions || []).length} Rules
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<HiOutlinePencilSquare />}
                                                onClick={() => handleOpenRoleModal(role)}
                                                sx={{ textTransform: "none", fontSize: "0.7rem" }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                                startIcon={<HiOutlineTrash />}
                                                onClick={() => handleDeleteRole(role.id)}
                                                sx={{ textTransform: "none", fontSize: "0.7rem" }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Capabilities Registry */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                        Capabilities Registry ({permissions.length})
                    </span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-500">
                        System Core
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {permissions.map((perm) => (
                        <div key={perm.id} className="rounded-xl border border-border bg-surface-elevated p-3 space-y-1">
                            <div className="text-xs font-bold text-foreground">{perm.name}</div>
                            <div className="text-[10px] text-muted-foreground">{perm.roles_count || 1} linked roles</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Role Modal */}
            <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {editingRoleId ? "Edit Security Role" : "Create Security Role"}
                </DialogTitle>
                <form onSubmit={handleSaveRole}>
                    <DialogContent dividers className="space-y-4">
                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Role Name
                            </label>
                            <input
                                type="text"
                                required
                                value={roleNameInput}
                                onChange={(e) => setRoleNameInput(e.target.value)}
                                className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                                placeholder="e.g. Audit Lead"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
                                Assign Access Capabilities
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {permissions.map((p) => {
                                    const checked = selectedPermissions.includes(p.id);

                                    return (
                                        <label
                                            key={p.id}
                                            onClick={() => togglePermissionCheck(p.id)}
                                            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold cursor-pointer select-none transition-all ${
                                                checked
                                                    ? "border-primary bg-primary/10 text-primary"
                                                    : "border-border bg-surface-elevated text-foreground"
                                            }`}
                                        >
                                            <input type="checkbox" checked={checked} readOnly className="h-4 w-4 rounded accent-primary" />
                                            <span>{p.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setRoleModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={savingRole} variant="contained">
                            {savingRole ? "Saving..." : "Establish Role"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default Security;