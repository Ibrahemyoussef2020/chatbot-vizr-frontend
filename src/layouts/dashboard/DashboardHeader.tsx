import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { HiOutlineBars3, HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setActiveWorkspace } from "@/redux/workspaceSlice";
import { useTheme } from "@/hooks/useTheme";

const DashboardHeader = ({ onMenu }: { onMenu: () => void }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { items, active, loading } = useAppSelector((state) => state.workspace);
    const { darkMode, toggleTheme } = useTheme();

    return (
        <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 text-foreground lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
                <IconButton className="xl:!hidden !text-foreground" aria-label="Open dashboard navigation" onClick={onMenu}>
                    <HiOutlineBars3 />
                </IconButton>
                <Select
                    className="min-w-48 !text-foreground !border-border"
                    size="small"
                    value={active?.slug || "all"}
                    displayEmpty
                    disabled={loading}
                    onChange={(event) => {
                        const value = event.target.value;
                        if (value === "all") {
                            dispatch(
                                setActiveWorkspace({
                                    id: "all",
                                    name: "All Workspaces (Global)",
                                    slug: "all",
                                    is_active: true,
                                    rate_limit: 60,
                                })
                            );
                        } else {
                            const workspace = items.find((item) => item.slug === value);
                            if (workspace) dispatch(setActiveWorkspace(workspace));
                        }
                    }}
                    aria-label="Active workspace"
                >
                    <MenuItem value="all">
                        <em>All Workspaces (Global)</em>
                    </MenuItem>
                    {items.map((workspace) => (
                        <MenuItem value={workspace.slug} key={workspace.id}>
                            {workspace.name}
                        </MenuItem>
                    ))}
                </Select>
            </div>

            <div className="flex items-center gap-3">
                <IconButton
                    onClick={toggleTheme}
                    className="!h-9 !w-9 !border !border-border !bg-surface-muted !text-warning"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? <HiOutlineSun className="text-xl" /> : <HiOutlineMoon className="text-xl" />}
                </IconButton>

                <div className="hidden text-right sm:block">
                    <strong className="block text-sm font-semibold">{user?.name}</strong>
                    <span className="block text-xs capitalize text-muted-foreground">{user?.role?.replace("_", " ") || "Member"}</span>
                </div>
                <Avatar className="!bg-primary !text-primary-foreground">{user?.name?.slice(0, 1).toUpperCase() || "U"}</Avatar>
            </div>
        </header>
    );
};

export default DashboardHeader;
