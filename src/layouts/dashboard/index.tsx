import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "@/redux/store";
import { fetchWorkspaces } from "@/redux/workspaceThunk";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

const Dashboard = () => {
    const dispatch = useAppDispatch();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchWorkspaces());
    }, [dispatch]);

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
            <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <main className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
                <DashboardHeader onMenu={() => setMobileOpen(true)} />
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
