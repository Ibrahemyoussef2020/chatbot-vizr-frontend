import { useEffect, useState } from "react";

export const useTheme = () => {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        const saved = localStorage.getItem("vizr-theme");
        if (saved) return saved !== "light";
        return true;
    });

    useEffect(() => {
        document.body.classList.toggle("light-theme", !darkMode);
        localStorage.setItem("vizr-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode((prev) => !prev);
    };

    return {
        darkMode,
        toggleTheme,
    };
};
