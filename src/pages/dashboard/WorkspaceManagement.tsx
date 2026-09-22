import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState, type FormEvent } from "react";
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineArrowPath } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import { workspaceServices } from "@/services";
import type { Workspace } from "@/services/core/workspace";

const empty = { name: "", business_name: "", industry: "", website_url: "", support_email: "", support_phone: "", country: "", timezone: "UTC", currency: "USD", rate_limit: "60", is_active: "active" };
type FormState = typeof empty;

const WorkspaceManagement = () => {
    const dispatch = useAppDispatch();
    const workspaces = useAppSelector(state => state.workspace.items);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Workspace | null>(null);
    const [form, setForm] = useState<FormState>(empty);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { void dispatch(fetchWorkspaces()); }, [dispatch]);

    const openEditor = (workspace?: Workspace) => {
        setEditing(workspace || null);
        setForm(workspace ? { name: workspace.name, business_name: workspace.business_name || "", industry: workspace.industry || "", website_url: workspace.website_url || "", support_email: workspace.support_email || "", support_phone: workspace.support_phone || "", country: workspace.country || "", timezone: workspace.timezone || "UTC", currency: workspace.currency || "USD", rate_limit: String(workspace.rate_limit), is_active: workspace.is_active ? "active" : "inactive" } : empty);
        setError("");
        setOpen(true);
    };

    const update = (key: keyof FormState, nextValue: string) => setForm(current => ({ ...current, [key]: nextValue }));
    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (!form.name.trim()) return;
        setBusy(true); setError("");
        try {
            const payload = { ...form, rate_limit: Number(form.rate_limit), is_active: form.is_active === "active" };
            if (editing) await workspaceServices.updateWorkspace(editing.id, payload);
            else await workspaceServices.createWorkspace(payload);
            await dispatch(fetchWorkspaces({ force: true })).unwrap();
            setOpen(false);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Workspace could not be saved.");
        } finally { setBusy(false); }
    };

    const fields: Array<[keyof FormState, string]> = [["name", "Workspace name"], ["business_name", "Business / legal name"], ["industry", "Industry"], ["website_url", "Website URL"], ["support_email", "Support email"], ["support_phone", "Support phone"], ["country", "Country"], ["timezone", "Timezone"], ["currency", "Currency"], ["rate_limit", "API rate limit / minute"]];

    return <div className="mx-auto w-full max-w-[1400px] space-y-6 p-1 sm:p-2">
        <header className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Administration</p><h1 className="text-3xl font-bold tracking-tight">Workspaces management</h1><p className="mt-2 text-sm text-muted-foreground">Create, review, and update business workspaces from one place.</p></div>
            <div className="flex gap-2"><Button startIcon={<HiOutlineArrowPath />} onClick={() => void dispatch(fetchWorkspaces({ force: true }))}>Refresh</Button><Button variant="contained" startIcon={<HiOutlinePlus />} onClick={() => openEditor()}>Add workspace</Button></div>
        </header>
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4"><h2 className="m-0 text-lg font-bold">All workspaces</h2><p className="m-0 mt-1 text-xs text-muted-foreground">{workspaces.length} workspace{workspaces.length === 1 ? "" : "s"}</p></div>
            <div className="divide-y divide-border">{workspaces.map(workspace => <div key={workspace.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><div><div className="flex items-center gap-2"><strong>{workspace.name}</strong><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${workspace.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{workspace.is_active ? "Active" : "Inactive"}</span></div><p className="m-0 mt-1 text-xs text-muted-foreground">{workspace.business_name || "No business name"} · {workspace.slug} · {workspace.selected_plan_code || "No plan"}</p></div><Button size="small" startIcon={<HiOutlinePencilSquare />} onClick={() => openEditor(workspace)}>Edit workspace</Button></div>)}{!workspaces.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">No workspaces found.</p>}</div>
        </section>
        <Dialog open={open} onClose={() => !busy && setOpen(false)} fullWidth maxWidth="md"><form onSubmit={save}><DialogTitle>{editing ? "Edit workspace" : "Add workspace"}</DialogTitle><DialogContent className="!grid !gap-3 !pt-2"><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{fields.map(([key, label]) => <TextField key={key} label={label} type={key === "support_email" ? "email" : key === "rate_limit" ? "number" : "text"} value={form[key]} onChange={event => update(key, event.target.value)} required={key === "name"} />)}<TextField select label="Status" value={form.is_active} onChange={event => update("is_active", event.target.value)}><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem></TextField></div>{error && <p className="m-0 text-sm text-danger" role="alert">{error}</p>}</DialogContent><DialogActions><Button onClick={() => setOpen(false)} disabled={busy}>Cancel</Button><Button type="submit" variant="contained" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create workspace"}</Button></DialogActions></form></Dialog>
    </div>;
};

export default WorkspaceManagement;
