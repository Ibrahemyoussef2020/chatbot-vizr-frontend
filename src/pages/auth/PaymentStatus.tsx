import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getSubscriptionStatus } from "@/services/payments/checkout";
import { useAppSelector } from "@/redux";

const PaymentStatus = () => {
    const user = useAppSelector((state) => state.auth.user);
    const location = useLocation();
    const navigate = useNavigate();
    const cancelled = location.pathname.endsWith("/cancel");
    const pendingReview = location.pathname.endsWith("/pending-review");
    const [message, setMessage] = useState("Checking payment confirmation...");

    useEffect(() => {
        if (!user || cancelled || pendingReview) return;
        let disposed = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const check = async () => {
            try {
                const status = await getSubscriptionStatus();
                if (disposed) return;
                if (status.active) {
                    navigate("/dashboard", { replace: true });
                    return;
                }
                setMessage("Payment received. Waiting for Stripe to confirm it securely...");
            } catch {
                if (!disposed) setMessage("We could not check the payment yet. You can retry from your setup page.");
            }
            if (!disposed) timer = setTimeout(check, 4000);
        };

        void check();
        return () => {
            disposed = true;
            if (timer) clearTimeout(timer);
        };
    }, [cancelled, navigate, pendingReview, user]);

    if (!user) return <Navigate to="/auth/login" replace state={{ from: location }} />;

    return (
        <main className="grid min-h-screen place-items-center p-5 text-foreground">
            <section className="w-full max-w-lg rounded-2xl border border-border bg-surface p-8 text-center shadow-[var(--shadow)]">
                <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-primary">{pendingReview ? "Payment review" : cancelled ? "Checkout cancelled" : "Payment status"}</p>
                <h1 className="mb-3 mt-3 text-2xl font-extrabold">{pendingReview ? "We’ll confirm your payment and activate your workspace" : cancelled ? "Your setup is saved" : "Almost there"}</h1>
                <p className="m-0 whitespace-pre-line leading-6 text-muted-foreground">{pendingReview ? `Your payment details were received. The platform team will verify the transfer and activate your workspace once it is confirmed.${sessionStorage.getItem("onboarding_payment_instructions") ? `\n\n${sessionStorage.getItem("onboarding_payment_instructions")}` : ""}` : cancelled ? "No payment was completed. Return to setup to try again or choose another plan." : message}</p>
                {pendingReview && sessionStorage.getItem("onboarding_payment_reference") && <p className="mt-4 text-sm text-muted-foreground">Reference: <span className="font-mono">{sessionStorage.getItem("onboarding_payment_reference")}</span></p>}
                <Link className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-white no-underline" to={pendingReview ? "/" : cancelled ? "/onboarding" : "/dashboard"}>
                    {pendingReview ? "Back to home" : cancelled ? "Return to setup" : "Check dashboard"}
                </Link>
            </section>
        </main>
    );
};

export default PaymentStatus;
