import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAppSelector } from "@/redux";

const navClass = ({ isActive }: { isActive: boolean }) => `text-sm font-semibold no-underline transition-colors ${isActive ? "text-[var(--theme-ink)]" : "text-[var(--theme-copy)] hover:text-[var(--theme-ink)]"}`;
const Brand = ({ close }: { close?: () => void }) => <Link className="flex items-center gap-2 no-underline" to="/" onClick={close} aria-label="Vizr home"><img className="h-10 w-10 object-contain drop-shadow-md" src="/robot.png" alt="" /><span className="flex flex-col leading-none"><strong className="text-lg font-black text-[var(--theme-ink)]">Vizr</strong><b className="text-[.6rem] font-black tracking-[.2em] text-[var(--theme-accent)]">AI CHATBOT</b></span></Link>;

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("vizr-theme") !== "light");
    const { isLoggedIn } = useAppSelector((state) => state.auth);
    const closeMenu = () => setMenuOpen(false);
    useEffect(() => { document.body.classList.toggle("light-theme", !darkMode); localStorage.setItem("vizr-theme", darkMode ? "dark" : "light"); }, [darkMode]);
    const themeButton = <IconButton className="!h-10 !w-10 !border !border-border !bg-surface !text-warning" title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} onClick={() => setDarkMode((value) => !value)}>{darkMode ? "☀" : "☾"}</IconButton>;
    return <header className="sticky top-0 z-[900] border-b border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-[calc(100%_-_2rem)] max-w-7xl items-center justify-between gap-8"><Brand close={closeMenu} />
            <nav className="flex items-center gap-8 max-md:hidden" aria-label="Main navigation"><NavLink className={navClass} to="/">Home</NavLink><a className="text-sm font-semibold text-[var(--theme-copy)] no-underline" href="/#integrations">Integrations</a><a className="text-sm font-semibold text-[var(--theme-copy)] no-underline" href="/#capabilities">Platform</a><NavLink className={navClass} to="/about">About</NavLink><NavLink className={navClass} to="/pricing">Plans</NavLink></nav>
            <div className="flex items-center gap-3 max-md:hidden">{themeButton}{isLoggedIn ? <Button component={Link} to="/dashboard" variant="contained" className="!bg-primary !font-bold !normal-case">Open dashboard</Button> : <><Button component={Link} to="/auth/login" className="!font-bold !normal-case !text-muted-foreground">Sign In</Button><Button component={Link} to="/auth/register" variant="contained" className="!bg-primary !font-bold !normal-case">Start Free Trial</Button></>}</div>
            <div className="hidden items-center gap-2 max-md:flex">{themeButton}<IconButton className="!flex !h-10 !w-10 !flex-col !gap-1 !rounded-xl !border !border-[var(--theme-border)] !bg-[var(--theme-surface)]" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><span className="h-0.5 w-5 bg-[var(--theme-ink)]"/><span className="h-0.5 w-5 bg-[var(--theme-ink)]"/><span className="h-0.5 w-5 bg-[var(--theme-ink)]"/></IconButton></div>
        </div>
        {menuOpen && <nav className="hidden border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 max-md:grid max-md:gap-3" aria-label="Mobile navigation"><NavLink className={navClass} onClick={closeMenu} to="/">Home</NavLink><a className="text-sm font-semibold text-[var(--theme-copy)]" onClick={closeMenu} href="/#integrations">Commerce integrations</a><a className="text-sm font-semibold text-[var(--theme-copy)]" onClick={closeMenu} href="/#capabilities">Platform capabilities</a><NavLink className={navClass} onClick={closeMenu} to="/about">About</NavLink><NavLink className={navClass} onClick={closeMenu} to="/pricing">Plans</NavLink><div className="mt-2 flex gap-2"><Button component={Link} onClick={closeMenu} to="/auth/login">Sign In</Button><Button component={Link} onClick={closeMenu} to="/auth/register" variant="contained">Start Free Trial</Button></div></nav>}
    </header>;
};
export default Header;
