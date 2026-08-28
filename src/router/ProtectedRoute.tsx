import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux";

const ProtectedRoute = () => {
    const location = useLocation();
    const { isLoggedIn, loading } = useAppSelector((state) => state.auth);

    if (loading) return <main aria-busy="true" className="grid min-h-[70vh] place-items-center p-8">Restoring your session…</main>;
    if (!isLoggedIn) return <Navigate to="/auth/login" replace state={{ from: location }} />;
    return <Outlet />;
};

export default ProtectedRoute;
