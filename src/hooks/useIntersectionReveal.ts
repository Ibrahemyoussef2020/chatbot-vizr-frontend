import { useEffect, useRef, useState } from "react";

export const useIntersectionReveal = <T extends HTMLElement>() => {
    const ref = useRef<T | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion || typeof IntersectionObserver === "undefined") {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            setIsVisible(true);
            observer.unobserve(entry.target);
        }, { threshold: 0.14, rootMargin: "0px 0px -40px" });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
};
