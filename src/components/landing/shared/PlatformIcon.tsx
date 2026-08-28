import type { IconType } from "react-icons";
import {
    HiOutlineBolt,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCheckCircle,
    HiOutlineEnvelope,
    HiOutlineKey,
    HiOutlineLockClosed,
    HiOutlineShoppingCart,
    HiOutlineSquares2X2,
    HiOutlineUserGroup,
} from "react-icons/hi2";
import {
    SiBigcommerce,
    SiInstagram,
    SiMessenger,
    SiShopify,
    SiTelegram,
    SiWhatsapp,
} from "react-icons/si";

interface PlatformIconProps {
    name: string;
    title?: string;
}

const platformIcons: Record<string, IconType> = {
    bigcommerce: SiBigcommerce,
    controlcenter: HiOutlineSquares2X2,
    email: HiOutlineEnvelope,
    hmacauth: HiOutlineKey,
    humanhandoff: HiOutlineUserGroup,
    instagram: SiInstagram,
    messenger: SiMessenger,
    secureprivate: HiOutlineLockClosed,
    shopify: SiShopify,
    slaguarantee: HiOutlineCheckCircle,
    smartpriority: HiOutlineBolt,
    telegram: SiTelegram,
    webchat: HiOutlineChatBubbleLeftRight,
    website: HiOutlineChatBubbleLeftRight,
    whatsapp: SiWhatsapp,
    whatsappbusiness: SiWhatsapp,
    woocommerce: HiOutlineShoppingCart,
};

const normalizePlatformName = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z]/g, "");
};

const MagentoIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M12 2 3.5 6.9v9.8L6.7 18.5V8.8L12 5.7l5.3 3.1v9.7l3.2-1.8V6.9L12 2Z"
            fill="currentColor"
        />
        <path
            d="m8.2 10.1 3.8 2.2 3.8-2.2v8.5L12 20.8l-3.8-2.2v-8.5Z"
            fill="currentColor"
        />
    </svg>
);

const PlatformIcon = ({ name, title }: PlatformIconProps) => {
    const normalizedName = normalizePlatformName(name);
    const isMagento = normalizedName.includes("magento")
        || normalizedName.includes("adobecommerce");
    const Icon = platformIcons[normalizedName];

    return (
        <span className="inline-grid h-[1.15em] w-[1.15em] shrink-0 place-items-center [&_svg]:block [&_svg]:h-full [&_svg]:w-full" role="img" aria-label={title || name}>
            {isMagento ? <MagentoIcon /> : Icon ? <Icon aria-hidden="true" /> : <HiOutlineChatBubbleLeftRight aria-hidden="true" />}
        </span>
    );
};

export default PlatformIcon;
