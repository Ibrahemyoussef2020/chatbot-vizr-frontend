import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import { getSubscriptionStatus } from "@/services/payments/checkout";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

const Dashboard = () => {
    const dispatch = useAppDispatch();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [workspacesLoaded, setWorkspacesLoaded] = useState(false);
    const [subscriptionActive, setSubscriptionActive] = useState(false);
    const [subscriptionChecked, setSubscriptionChecked] = useState(false);
    const { user } = useAppSelector((state) => state.auth);
    const { active, loading } = useAppSelector((state) => state.workspace);

    useEffect(() => {
        let current = true;
        const load = async () => {
            try {
                await dispatch(fetchWorkspaces()).unwrap();
                if (user?.role === "super_admin") {
                    setSubscriptionActive(true);
                } else {
                    const status = await getSubscriptionStatus();
                    setSubscriptionActive(status.active);
                }
            } catch {
                setSubscriptionActive(false);
            } finally {
                if (current) {
                    setWorkspacesLoaded(true);
                    setSubscriptionChecked(true);
                }
            }
        };
        void load();
        return () => { current = false; };
    }, [dispatch, user?.role]);

    if (!workspacesLoaded || !subscriptionChecked || loading) {
        return <main aria-busy="true" className="grid min-h-screen place-items-center text-muted-foreground">Loading your workspace...</main>;
    }

    if (user?.role !== "super_admin" && (!active?.business_name || !active.selected_plan_code || !subscriptionActive)) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
            <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <main className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
                <DashboardHeader onMenu={() => setMobileOpen(true)} />
                <div className="dashboard-content min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-2 lg:px-8 lg:pb-8 lg:pt-3">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
