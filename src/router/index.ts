import { createBrowserRouter } from 'react-router-dom';
import { createElement } from "react";
import landingRouter from "./landing";
import authRouter from './auth';
import dashboardRouter from "./dashboard";
import RouteError from "./RouteError";


const router = createBrowserRouter([
    ...[...landingRouter, ...authRouter, ...dashboardRouter].map((route) => ({
        ...route,
        errorElement: createElement(RouteError),
    })),
]);

export default router
