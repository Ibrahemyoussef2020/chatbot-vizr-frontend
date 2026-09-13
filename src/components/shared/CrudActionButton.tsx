import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { HiOutlineCheck, HiOutlineEye, HiOutlinePencilSquare, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi2";

const actionIcons = {
    create: HiOutlinePlus,
    read: HiOutlineEye,
    edit: HiOutlinePencilSquare,
    delete: HiOutlineTrash,
    save: HiOutlineCheck,
};

interface CrudActionButtonProps {
    action: keyof typeof actionIcons;
    label: string;
    to?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    busy?: boolean;
}

const CrudActionButton = ({ action, label, to, onClick, type = "button", disabled = false, busy = false }: CrudActionButtonProps) => {
    const Icon = actionIcons[action];
    const content = busy ? <CircularProgress size={20} color="inherit" aria-hidden="true" /> : <Icon size={22} aria-hidden="true" />;
    const buttonProps = {
        "aria-label": label,
        "aria-busy": busy,
        disabled: disabled || busy,
        color: action === "delete" ? "error" as const : "primary" as const,
        onClick,
    };

    return (
        <Tooltip title={label}>
            <span className="inline-flex">
                {to ? (
                    <IconButton {...buttonProps} component={Link} to={to}>{content}</IconButton>
                ) : (
                    <IconButton {...buttonProps} type={type}>{content}</IconButton>
                )}
            </span>
        </Tooltip>
    );
};

export default CrudActionButton;
