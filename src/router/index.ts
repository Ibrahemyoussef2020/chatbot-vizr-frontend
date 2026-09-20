import { createBrowserRouter } from 'react-router-dom';
import { createElement } from "react";
import landingRouter from "./landing";
import authRouter from './auth';
import dashboardRouter from "./dashboard";
import RouteError from "./RouteError";
import SharedKnowledgeOutput from "@/pages/SharedKnowledgeOutput";
import PaymentStatus from "@/pages/auth/PaymentStatus";


const router = createBrowserRouter([
    { path: "/shared/knowledge/:token", element: createElement(SharedKnowledgeOutput), errorElement: createElement(RouteError) },
    { path: "/payment/success", element: createElement(PaymentStatus), errorElement: createElement(RouteError) },
    { path: "/payment/cancel", element: createElement(PaymentStatus), errorElement: createElement(RouteError) },
    ...[...landingRouter, ...authRouter, ...dashboardRouter].map((route) => ({
        ...route,
        errorElement: createElement(RouteError),
    })),
]);

export default router
