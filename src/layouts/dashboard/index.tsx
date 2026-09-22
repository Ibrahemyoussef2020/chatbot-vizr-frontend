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
    const [paymentPending, setPaymentPending] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "awaiting_review" | "succeeded" | null>(null);
    const [rejected, setRejected] = useState(false);
    const [rejectionMessage, setRejectionMessage] = useState("");
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
                    setPaymentPending(status.pending);
                    setPaymentStatus(status.paymentStatus);
                    setRejected(Boolean(status.rejected));
                    setRejectionMessage(status.rejectionMessage || "");
                }
            } catch {
                setSubscriptionActive(false);
                setPaymentPending(false);
                setPaymentStatus(null);
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

    useEffect(() => {
        if (!paymentPending || user?.role === "super_admin") return;
        let current = true;
        const timer = window.setInterval(() => {
            void getSubscriptionStatus().then(status => {
                if (!current) return;
                setSubscriptionActive(status.active);
                setPaymentPending(status.pending);
                setPaymentStatus(status.paymentStatus);
                setRejected(Boolean(status.rejected));
                setRejectionMessage(status.rejectionMessage || "");
            }).catch(() => undefined);
        }, 15000);
        return () => {
            current = false;
            window.clearInterval(timer);
        };
    }, [paymentPending, user?.role]);

    if (!workspacesLoaded || !subscriptionChecked || loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
                <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
                <main className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
                    <DashboardHeader onMenu={() => setMobileOpen(true)} />
                    <div className="dashboard-content grid min-h-0 flex-1 place-items-center overflow-y-auto px-4 py-8 text-muted-foreground lg:px-8" aria-busy="true">
                        Loading your workspace...
                    </div>
                </main>
            </div>
        );
    }

    if (user?.role !== "super_admin" && (!active?.business_name || ((!active.selected_plan_code || !subscriptionActive) && !paymentPending && !rejected))) {
        return <Navigate to="/onboarding" replace />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
            <DashboardSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
            <main className="flex min-w-0 flex-1 flex-col bg-background text-foreground">
                <DashboardHeader onMenu={() => setMobileOpen(true)} />
                {paymentPending && <div role="status" className="border-b border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning lg:px-8">
                    {paymentStatus === "succeeded"
                        ? "تم تأكيد الدفع. مساحة العمل بانتظار اكتمال التفعيل."
                        : paymentStatus === "awaiting_review"
                            ? "مساحة العمل بانتظار مراجعة الدفع وتأكيد التحويل."
                            : "مساحة العمل بانتظار تأكيد الدفع. سنحدّث حالتها تلقائيًا عند وصول التأكيد."}
                </div>}
                <div className="dashboard-content min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-2 lg:px-8 lg:pb-8 lg:pt-3">
                    {paymentPending || rejected ? (
                        <section className={`mx-auto !p-4 mb-6 mt-4 max-w-2xl rounded-2xl border bg-surface p-10 text-center shadow-sm sm:p-12 ${rejected ? "border-danger/40" : "border-warning/30"}`} aria-live="polite">
                            <p className={`m-0 text-xs font-bold uppercase tracking-widest ${rejected ? "text-danger" : "text-warning"}`}>Workspace activation</p>
                            <h1 className="mb-3 mt-3 text-2xl font-extrabold">{active?.name || "Your workspace"} is waiting for activation</h1>
                            <p className="m-0 leading-6 text-muted-foreground">{rejected
                                ? rejectionMessage
                                : paymentStatus === "awaiting_review"
                                ? "Your payment details were received. The platform team will review the transfer and activate this workspace after confirming it."
                                : paymentStatus === "succeeded"
                                    ? "Stripe confirmed your payment. Your workspace will be available as soon as activation finishes."
                                    : "Your workspace has been created. It will activate automatically after Stripe confirms the payment."}</p>
                            {active?.selected_plan_code && <p className="mb-0 mt-4 text-sm text-muted-foreground">Selected plan: <strong className="capitalize text-foreground">{active.selected_plan_code}</strong></p>}
                            <p className="mb-0 mt-5 text-xs text-muted-foreground">This page checks for activation automatically every 15 seconds.</p>
                        </section>
                    ) : <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
