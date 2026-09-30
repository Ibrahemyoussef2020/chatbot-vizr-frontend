import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineArrowUp, HiOutlineCreditCard } from "react-icons/hi2";

const LandingFloatingActions = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const update = () => setVisible(window.scrollY > 240);
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-24 right-5 z-[1000] flex flex-col gap-2" aria-label="Quick actions">
            <button
                type="button"
                aria-label="Scroll to top"
                title="Scroll to top"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="grid h-12 w-12 place-items-center rounded-full border border-primary bg-primary text-xl text-primary-foreground shadow-[var(--shadow)] transition hover:scale-105 hover:bg-primary/90"
            >
                <HiOutlineArrowUp aria-hidden="true" />
            </button>
            <Link
                to="/pricing"
                aria-label="Subscribe"
                title="Subscribe"
                className="grid h-12 w-12 place-items-center rounded-full border border-secondary bg-secondary text-xl text-secondary-foreground no-underline shadow-[var(--shadow)] transition hover:scale-105 hover:bg-secondary/90"
            >
                <HiOutlineCreditCard aria-hidden="true" />
            </Link>
        </div>
    );
};

export default LandingFloatingActions;
