import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux";
import { logoutAsync } from "@/redux/authThunk";

const desktopLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Plans", to: "/pricing" },
    { label: "Privacy", to: "/policy-terms" },
    { label: "Data deletion", to: "/data-deletion" },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold no-underline transition-colors  ${isActive ? "text-[var(--theme-ink)]" : "text-[var(--theme-copy)] hover:text-[var(--theme-ink)]"}`;

function Brand({ onClick }: { onClick: () => void }) {
    return (
        <Link className="flex items-center gap-2 no-underline" to="/" onClick={onClick} aria-label="Vizr home">
            <img className="h-10 w-10 object-contain drop-shadow-md" src="/robot.png" alt="" />
            <span className="flex flex-col leading-none">
                <strong className="text-lg font-black text-[var(--theme-ink)]">Vizr</strong>
                <b className="text-[.6rem] font-black tracking-[.2em] text-[var(--theme-accent)]">AI CHATBOT</b>
            </span>
        </Link>
    );
}

function ThemeButton({ darkMode, onToggle }: { darkMode: boolean; onToggle: () => void }) {
    return (
        <IconButton
            className="!h-10 !w-10 !border !border-border !bg-surface !text-warning"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={onToggle}
        >
            {darkMode ? "☀" : "☾"}
        </IconButton>
    );
}

function DesktopAccount({ onLogout, loading }: { onLogout: () => void; loading: boolean }) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const user = useAppSelector((state) => state.auth.user);
    const close = () => setAnchor(null);
    const initial = (user?.name?.trim()?.[0] || user?.email?.[0] || "U").toUpperCase();

    return (
        <div>
            <Button
                onClick={(event) => setAnchor(event.currentTarget)}
                aria-haspopup="menu"
                aria-expanded={Boolean(anchor)}
                className="!min-w-0 !gap-3 !rounded-xl !border !border-[var(--theme-border)] !px-3 !py-2 !font-bold !normal-case !text-[var(--theme-ink)]"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-black text-white">{initial}</span>
                <span className="max-w-32 truncate">{user?.name || "My account"}</span>
            </Button>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={close}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{
                    paper: {
                        sx: {
                            p: 1.25,
                            mt: 1,
                            width: 224,
                            borderRadius: "0 0 12px 12px",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--surface-elevated)",
                            color: "var(--foreground)",
                            boxShadow: "0 16px 40px rgb(0 0 0 / 32%)",
                        },
                    },
                }}
            >
                <div className="flex items-center gap-3 border-b border-[var(--border)] px-2 pb-4 pt-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">{initial}</span>
                    <div className="min-w-0">
                        <p className="m-0 truncate text-sm font-semibold">{user?.name || "Account"}</p>
                        {user?.email && <p className="mb-0 mt-1 truncate text-xs text-[var(--muted-foreground)]">{user.email}</p>}
                        {user?.role && <p className="mb-0 mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary)]">{user.role.replaceAll("_", " ")}</p>}
                    </div>
                </div>
                <MenuItem component={Link} to="/dashboard" onClick={close} className="!mx-0 !mt-2 !min-h-11 !rounded-lg !px-3 !font-semibold !text-[var(--foreground)] hover:!bg-[var(--surface-muted)]">
                    Dashboard
                </MenuItem>
                <MenuItem onClick={onLogout} disabled={loading} className="!mx-0 !mt-1 !min-h-11 !rounded-lg !px-3 !font-semibold !text-[var(--danger)] hover:!bg-[var(--surface-muted)]">
                    {loading ? "Logging out..." : "Log out"}
                </MenuItem>
            </Menu>
        </div>
    );
}

function AuthLinks({ onClick }: { onClick?: () => void }) {
    return (
        <>
            <Button component={Link} to="/auth/login" onClick={onClick} className="!font-bold !normal-case !text-muted-foreground">Sign In</Button>
            <Button component={Link} to="/auth/register" onClick={onClick} variant="contained" className="!bg-primary !font-bold !normal-case">Start Free Trial</Button>
        </>
    );
}

function MobileAccount({ onLogout, loading, closeMenu }: { onLogout: () => void; loading: boolean; closeMenu: () => void }) {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <>
            <div className="mt-2 rounded-xl border border-[var(--theme-border)] p-3">
                <p className="m-0 truncate text-sm font-black text-[var(--theme-ink)]">{user?.name || "Account"}</p>
                {user?.email && <p className="mb-0 mt-1 truncate text-xs text-[var(--theme-copy)]">{user.email}</p>}
                {user?.role && <p className="mb-0 mt-2 text-[10px] font-bold uppercase text-primary">{user.role.replaceAll("_", " ")}</p>}
            </div>
            <div className="flex gap-2">
                <Button component={Link} onClick={closeMenu} to="/dashboard" variant="contained" className="!normal-case">Dashboard</Button>
                <Button onClick={onLogout} disabled={loading} className="!normal-case !text-error">
                    {loading ? "Logging out..." : "Log out"}
                </Button>
            </div>
        </>
    );
}

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("vizr-theme") !== "light");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoggedIn, loading } = useAppSelector((state) => state.auth);
    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        document.body.classList.toggle("light-theme", !darkMode);
        localStorage.setItem("vizr-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const handleLogout = async () => {
        closeMenu();
        await dispatch(logoutAsync());
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-[900] border-b border-[var(--theme-border)] bg-[var(--theme-surface)] backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-[calc(100%_-_2rem)] max-w-7xl items-center justify-between gap-8">
                <Brand onClick={closeMenu} />

                <nav className="flex items-center gap-6 max-md:hidden" aria-label="Main navigation">
                    {desktopLinks.slice(0, 1).map(({ label, to }) => <NavLink key={to} className={navClass} to={to}>{label}</NavLink>)}
                    <a className="text-sm font-semibold text-[var(--theme-copy)] no-underline" href="/#integrations">Integrations</a>
                    <a className="text-sm font-semibold text-[var(--theme-copy)] no-underline" href="/#capabilities">Platform</a>
                    {desktopLinks.slice(1).map(({ label, to }) => <NavLink key={to} className={navClass} to={to}>{label}</NavLink>)}
                </nav>

                <div className="flex items-center gap-3 max-md:hidden">
                    <ThemeButton darkMode={darkMode} onToggle={() => setDarkMode((value) => !value)} />
                    {isLoggedIn ? <DesktopAccount onLogout={handleLogout} loading={loading} /> : <AuthLinks />}
                </div>

                <div className="hidden items-center gap-2 max-md:flex">
                    <ThemeButton darkMode={darkMode} onToggle={() => setDarkMode((value) => !value)} />
                    <IconButton
                        className="!flex !h-10 !w-10 !flex-col !gap-1 !rounded-xl !border !border-[var(--theme-border)] !bg-[var(--theme-surface)]"
                        aria-label="Toggle navigation"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((value) => !value)}
                    >
                        <span className="h-0.5 w-5 bg-[var(--theme-ink)]" />
                        <span className="h-0.5 w-5 bg-[var(--theme-ink)]" />
                        <span className="h-0.5 w-5 bg-[var(--theme-ink)]" />
                    </IconButton>
                </div>
            </div>

            {menuOpen && (
                <nav className="hidden border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 max-md:grid max-md:gap-3" aria-label="Mobile navigation">
                    <NavLink className={navClass} onClick={closeMenu} to="/">Home</NavLink>
                    <a className="text-sm font-semibold text-[var(--theme-copy)]" onClick={closeMenu} href="/#integrations">Integrations</a>
                    <a className="text-sm font-semibold text-[var(--theme-copy)]" onClick={closeMenu} href="/#capabilities">Platform</a>
                    {desktopLinks.slice(1).map(({ label, to }) => <NavLink key={to} className={navClass} onClick={closeMenu} to={to}>{label}</NavLink>)}
                    {isLoggedIn
                        ? <MobileAccount onLogout={handleLogout} loading={loading} closeMenu={closeMenu} />
                        : <div className="mt-2 flex gap-2"><AuthLinks onClick={closeMenu} /></div>}
                </nav>
            )}
        </header>
    );
}

export default Header;
