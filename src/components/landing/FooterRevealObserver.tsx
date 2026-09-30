import { useEffect } from "react";

const FooterRevealObserver = () => {
    useEffect(() => {
        const footer = document.querySelector("footer");
        if (!footer) return;

        footer.classList.add("landing-reveal", "landing-reveal-up");
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                footer.classList.add("is-visible");
                observer.disconnect();
            }
        }, { threshold: 0.08 });

        observer.observe(footer);
        return () => observer.disconnect();
    }, []);

    return null;
};

export default FooterRevealObserver;
