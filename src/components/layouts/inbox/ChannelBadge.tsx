import { FaTelegram, FaWhatsapp } from "react-icons/fa6";
import { HiOutlineEnvelope, HiOutlineGlobeAlt } from "react-icons/hi2";

type Channel = "web" | "whatsapp" | "telegram" | "gmail";

const channelStyles: Record<Channel, string> = {
    web: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    whatsapp: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    telegram: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    gmail: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const channelIcons = {
    web: HiOutlineGlobeAlt,
    whatsapp: FaWhatsapp,
    telegram: FaTelegram,
    gmail: HiOutlineEnvelope,
};

export const ChannelBadge = ({ channel = "web", compact = false }: { channel?: string; compact?: boolean }) => {
    const normalized = (channel in channelIcons ? channel : "web") as Channel;
    const Icon = channelIcons[normalized];

    return (
        <span
            title={`Received from ${normalized}`}
            className={`inline-flex items-center gap-1 rounded-full font-bold uppercase ${channelStyles[normalized]} ${
                compact ? "h-6 w-6 justify-center text-xs" : "px-2 py-0.5 text-[9px]"
            }`}
        >
            <Icon aria-hidden="true" />
            {!compact && <span>{normalized}</span>}
        </span>
    );
};
