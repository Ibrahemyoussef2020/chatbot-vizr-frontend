import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    HiOutlineChatBubbleLeftRight,
    HiOutlineInformationCircle,
    HiOutlineCog6Tooth,
    HiOutlinePuzzlePiece,
    HiOutlineShieldCheck,
} from "react-icons/hi2";
import { useAppSelector } from "@/redux/store";

const Settings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const activeWorkspace = useAppSelector((state) => state.workspace.active);

    const navItems = [
        {
            id: "channels",
            label: "Channels",
            path: "/dashboard/settings/channels",
            icon: HiOutlineChatBubbleLeftRight,
        },
        {
            id: "chatbot",
            label: "Chatbot Info",
            path: "/dashboard/settings",
            icon: HiOutlineInformationCircle,
            exact: true,
        },
        {
            id: "configs",
            label: "Configs",
            path: "/dashboard/settings/configs",
            icon: HiOutlineCog6Tooth,
        },
        {
            id: "widget",
            label: "Widget",
            path: "/dashboard/settings/widget",
            icon: HiOutlinePuzzlePiece,
        },
        {
            id: "security",
            label: "Security",
            path: "/dashboard/settings/security",
            icon: HiOutlineShieldCheck,
        },
    ];

    const isActive = (item: (typeof navItems)[0]) => {
        if (item.exact) {
            return location.pathname === "/dashboard/settings" || location.pathname === "/dashboard/settings/";
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="mx-auto w-full max-w-[1600px] p-1 text-foreground space-y-6">
            {/* Header */}
            <header className="border-b border-border pb-4">
                <p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Workspace Preferences</p>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                    <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Settings</h1>
                    {activeWorkspace && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            Active Scope: {activeWorkspace.name}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    Manage channels, chatbot identity, website configurations, widget customization, and security roles.
                </p>
            </header>

            {/* Layout Grid: Sidebar Navigation + Main Content Area */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0 rounded-2xl border border-border bg-surface-elevated p-2 shadow-sm sticky top-6">
                    <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                        {navItems.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 w-full text-left whitespace-nowrap ${
                                        active
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="text-lg" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Sub-Route Main Content Area */}
                <main className="flex-1 w-full rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm min-h-[550px] relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Settings;