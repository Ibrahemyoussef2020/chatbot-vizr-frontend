import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const RouteError = () => {
    const error = useRouteError();
    const message = isRouteErrorResponse(error)
        ? error.statusText || error.data?.message
        : error instanceof Error ? error.message : "An unexpected error occurred.";

    return <main className="mx-auto flex min-h-screen w-[min(720px,90%)] flex-col items-start justify-center" role="alert">
        <p className="font-extrabold uppercase tracking-[.15em] text-accent">Something went wrong</p>
        <h1 className="my-3 text-[clamp(2rem,6vw,4rem)]">We couldn’t display this page.</h1>
        <p>{message}</p>
        <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-xl border-0 bg-primary px-5 py-3 font-extrabold text-primary-foreground" onClick={() => window.location.reload()}>Try again</button>
            <Link className="rounded-xl border border-border px-5 py-3 font-extrabold text-foreground no-underline" to="/">Return home</Link>
        </div>
    </main>;
};

export default RouteError;
