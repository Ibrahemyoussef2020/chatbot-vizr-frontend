import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { HiOutlineArrowPath, HiOutlineFunnel, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useUrlSearchParams } from "@/hooks/useUrlSearchParams";

const selectSx = {
    color: "var(--foreground)",
    backgroundColor: "var(--surface)",
    borderRadius: "0.5rem",
    fontSize: "0.75rem",
    ".MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--border)",
        borderWidth: "1px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--primary)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--primary)",
    },
    ".MuiSvgIcon-root": {
        color: "var(--foreground)",
    },
};

const menuProps = {
    slotProps: {
        paper: {
            sx: {
                backgroundColor: "var(--surface-elevated)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                ".MuiMenuItem-root": {
                    fontSize: "0.75rem",
                    color: "var(--foreground)",
                    paddingY: "0.5rem",
                    "&:hover": {
                        backgroundColor: "var(--surface-muted)",
                    },
                    "&.Mui-selected": {
                        backgroundColor: "var(--primary-muted)",
                        color: "var(--primary)",
                        fontWeight: "700",
                    },
                },
            },
        },
    },
};

export const DashboardFilterBar = () => {
    const { filters, setFilter, resetFilters } = useUrlSearchParams();

    return (
        <Card
            variant="outlined"
            className="!rounded-2xl !border-border !bg-surface-elevated p-4 text-foreground shadow-sm"
        >
            <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-foreground uppercase tracking-wider">
                    <HiOutlineFunnel className="text-primary text-base" /> Operational Filter Controls
                </div>

                <Button
                    variant="text"
                    size="small"
                    startIcon={<HiOutlineArrowPath />}
                    onClick={resetFilters}
                    className="!normal-case !font-semibold !text-xs !text-muted-foreground hover:!text-danger"
                >
                    Reset Filters
                </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                <div>
                    <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                        Status
                    </span>
                    <Select
                        size="small"
                        fullWidth
                        value={filters.status}
                        onChange={(e) => setFilter("status", e.target.value)}
                        sx={selectSx}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="open">Active / Open</MenuItem>
                        <MenuItem value="closed">Closed / Ended</MenuItem>
                        <MenuItem value="pending">Pending Agent</MenuItem>
                    </Select>
                </div>

                <div>
                    <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                        Channel
                    </span>
                    <Select
                        size="small"
                        fullWidth
                        value={filters.channel}
                        onChange={(e) => setFilter("channel", e.target.value)}
                        sx={selectSx}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="all">All Channels</MenuItem>
                        <MenuItem value="web">Web Chat Widget</MenuItem>
                        <MenuItem value="whatsapp">WhatsApp Business</MenuItem>
                        <MenuItem value="telegram">Telegram Bot</MenuItem>
                        <MenuItem value="api">Commerce API</MenuItem>
                    </Select>
                </div>

                <div>
                    <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                        Time Window
                    </span>
                    <Select
                        size="small"
                        fullWidth
                        value={filters.days}
                        onChange={(e) => setFilter("days", Number(e.target.value))}
                        sx={selectSx}
                        MenuProps={menuProps}
                    >
                        <MenuItem value={7}>Last 7 Days</MenuItem>
                        <MenuItem value={30}>Last 30 Days</MenuItem>
                        <MenuItem value={90}>Last 90 Days</MenuItem>
                        <MenuItem value={365}>All Time</MenuItem>
                    </Select>
                </div>

                <div>
                    <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                        Priority
                    </span>
                    <Select
                        size="small"
                        fullWidth
                        value={filters.priority}
                        onChange={(e) => setFilter("priority", e.target.value)}
                        sx={selectSx}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="all">All Priorities</MenuItem>
                        <MenuItem value="high">High Priority</MenuItem>
                        <MenuItem value="medium">Medium Priority</MenuItem>
                        <MenuItem value="low">Low Priority</MenuItem>
                    </Select>
                </div>

                <div>
                    <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                        Topic Category
                    </span>
                    <Select
                        size="small"
                        fullWidth
                        value={filters.topic}
                        onChange={(e) => setFilter("topic", e.target.value)}
                        sx={selectSx}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="all">All Topics</MenuItem>
                        <MenuItem value="shipping">Shipping & Delivery</MenuItem>
                        <MenuItem value="refunds">Returns & Refunds</MenuItem>
                        <MenuItem value="specs">Product Specifications</MenuItem>
                        <MenuItem value="billing">Billing & Subscriptions</MenuItem>
                        <MenuItem value="integration">Integration & Setup</MenuItem>
                    </Select>
                </div>

                <div>
                    <span className="mb-1 block text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                        Time / Sort
                    </span>
                    <Select
                        size="small"
                        fullWidth
                        value={filters.sort}
                        onChange={(e) => setFilter("sort", e.target.value)}
                        sx={selectSx}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="newest">Newest First</MenuItem>
                        <MenuItem value="oldest">Oldest First</MenuItem>
                    </Select>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <HiOutlineMagnifyingGlass className="text-muted-foreground text-lg shrink-0" />
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search by visitor name, email, phone, or ticket ID…"
                    value={filters.search}
                    onChange={(e) => setFilter("search", e.target.value)}
                    sx={{
                        color: "var(--foreground)",
                        backgroundColor: "var(--surface)",
                        borderRadius: "0.5rem",
                        ".MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--border)",
                            borderWidth: "1px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--primary)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "var(--primary)",
                        },
                        input: {
                            color: "var(--foreground)",
                            fontSize: "0.75rem",
                            "&::placeholder": {
                                color: "var(--muted-foreground)",
                                opacity: 0.8,
                            },
                        },
                    }}
                />
            </div>
        </Card>
    );
};
