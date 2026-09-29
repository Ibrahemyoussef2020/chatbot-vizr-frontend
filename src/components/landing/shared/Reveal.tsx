import type { CSSProperties, ReactNode } from "react";
import { useIntersectionReveal } from "@/hooks/useIntersectionReveal";

type RevealProps = {
    children: ReactNode;
    delay?: number;
    className?: string;
    variant?: "up" | "left" | "right" | "zoom" | "focus";
};

const Reveal = ({ children, delay = 0, className = "", variant = "up" }: RevealProps) => {
    const { ref, isVisible } = useIntersectionReveal<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={`landing-reveal landing-reveal-${variant} ${isVisible ? "is-visible" : ""} ${className}`}
            style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
        >
            {children}
        </div>
    );
};

export default Reveal;
