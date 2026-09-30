import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useEffect, useState, type FormEvent } from "react";
import { useAppSelector } from "@/redux/store";
import { fetchSecurityRoles, type SecurityRoleData } from "@/services/auth/securityRole";
import { assignWorkspaceUserRole, createWorkspaceUser, fetchWorkspaceUsers, type WorkspaceUser } from "@/services/auth/workspaceUsers";

const Users = () => {
    const workspace = useAppSelector((state) => state.workspace.active);
    const [users, setUsers] = useState<WorkspaceUser[]>([]);
    const [roles, setRoles] = useState<SecurityRoleData[]>([]);
    const [saving, setSaving] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const load = async () => {
        const [usersResult, rolesResult] = await Promise.allSettled([fetchWorkspaceUsers(workspace?.slug), fetchSecurityRoles(workspace?.slug)]);
        if (usersResult.status === "fulfilled") setUsers(usersResult.value); else setMessage("Users could not be loaded.");
        if (rolesResult.status === "fulfilled") setRoles(rolesResult.value); else setMessage("Security roles could not be loaded. Refresh and try again.");
    };
    useEffect(() => { void load(); }, [workspace?.slug]);
    const updateRole = async (user: WorkspaceUser, roleId: string) => {
        setSaving(user.id); setMessage("");
        try { await assignWorkspaceUserRole(user.id, roleId, workspace?.slug); setMessage("Role updated."); await load(); } catch { setMessage("This role cannot be assigned from your access level."); } finally { setSaving(null); }
    };
    const addUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setAdding(true); setMessage("");
        try { await createWorkspaceUser({ name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), roleId: String(form.get("roleId")) }, workspace?.slug); setAddOpen(false); event.currentTarget.reset(); setMessage("User created in the current workspace. They can sign in with the email and password provided."); await load(); } catch (error: any) { setMessage(error?.response?.data?.message || "User could not be created."); } finally { setAdding(false); }
    };
    return <section className="space-y-5">
        <header><p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Workspace</p><h1 className="mt-1 text-2xl font-black">Users</h1><p className="mt-1 text-sm text-muted-foreground">Manage logged-in workspace accounts and assign their security roles. Customers are not included.</p></header>
        <div className="flex flex-wrap items-center justify-between gap-3">{message && <p className="m-0 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-muted-foreground">{message}</p>}<Button variant="contained" onClick={() => setAddOpen(true)}>Add user</Button></div>
        {addOpen && <form onSubmit={(event) => void addUser(event)} className="user-create-form grid gap-3 rounded-xl border border-border bg-surface-muted p-4 md:grid-cols-2"><h2 className="m-0 text-lg font-bold md:col-span-2">Create login account</h2><TextField name="name" label="Full name" required /><TextField name="email" type="email" label="Email" required /><TextField name="password" type="password" label="Temporary password" required slotProps={{ htmlInput: { minLength: 8 } }} /><TextField select name="roleId" label="Security role" required defaultValue="" disabled={!roles.length}><MenuItem value="" disabled>{roles.length ? "Select a role" : "No roles available"}</MenuItem>{roles.filter((role) => role.scope === "workspace" || role.code === "business_admin" || role.code === "workspace_owner" || role.code === "workspace_admin" || role.code === "workspace_agent").map((role) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}</TextField>{!roles.length && <p className="m-0 text-xs text-warning md:col-span-2">No security roles were returned for this workspace. Refresh the page after the workspace finishes loading.</p>}<div className="flex justify-end gap-2 md:col-span-2"><Button onClick={() => setAddOpen(false)} disabled={adding}>Cancel</Button><Button type="submit" variant="contained" disabled={adding || !roles.length}>{adding ? "Creating…" : "Create user"}</Button></div></form>}
        <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-surface-muted text-xs uppercase text-muted-foreground"><tr><th className="p-3">User</th><th className="p-3">Legacy role</th><th className="p-3">Security role</th><th className="p-3">Status</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-border"><td className="p-3"><strong className="block">{user.name}</strong><span className="text-xs text-muted-foreground">{user.email}</span></td><td className="p-3 capitalize">{String(user.legacyRole || user.securityRole?.code || "member").replace("_", " ")}</td><td className="p-3"><TextField select size="small" value={user.securityRole?.id || ""} disabled={saving === user.id} onChange={(event) => void updateRole(user, event.target.value)} className="min-w-52"><MenuItem value="" disabled>No role assigned</MenuItem>{roles.filter((role) => role.scope === "workspace" || role.code === "business_admin").map((role) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}</TextField></td><td className="p-3">{user.isActive ? "Active" : "Paused"}</td></tr>)}</tbody></table>{!users.length && <p className="p-8 text-center text-sm text-muted-foreground">No workspace users found.</p>}</div>
        <Button variant="outlined" onClick={() => void load()}>Refresh</Button>
    </section>;
};

export default Users;
