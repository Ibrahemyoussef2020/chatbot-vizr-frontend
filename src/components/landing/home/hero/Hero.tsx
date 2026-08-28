import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    HiOutlineBolt,
    HiOutlineChatBubbleLeftRight,
    HiOutlineLockClosed,
    HiOutlineUserGroup,
} from "react-icons/hi2";
import type {
    ConversationItem,
    HeroMetricItem,
    LandingSectionItem,
} from "@/services/landing";
import PlatformIcon from "../../shared/PlatformIcon";

type HeroProps = {
    eyebrow?: string;
    title?: string;
    description?: string;
    demoItems: LandingSectionItem[];
};

const heroChannels = [
    { name: "WhatsApp", pill: "border-[#25d366] bg-[#25d36622] !text-foreground", message: "!bg-[#25d366]" },
    { name: "Telegram", pill: "border-[#29b6f6] bg-[#29b6f622] !text-foreground", message: "!bg-[#29b6f6]" },
    { name: "Instagram", pill: "border-[#e1306c] bg-[#e1306c22] !text-foreground", message: "!bg-[#e1306c]" },
    { name: "Messenger", pill: "border-[#0084ff] bg-[#0084ff22] !text-foreground", message: "!bg-[#0084ff]" },
    { name: "Web Chat", pill: "border-[#00b9eb] bg-[#00b9eb22] !text-foreground", message: "!bg-[#00b9eb]" },
];

const highlights = [
    { Icon: HiOutlineBolt, value: "< 5 Seconds", text: "Average response latency across channels" },
    { Icon: HiOutlineLockClosed, value: "Private RAG", text: "Zero public base model training" },
    { Icon: HiOutlineUserGroup, value: "1-Click Handoff", text: "Humans step in seamlessly anytime" },
    { Icon: HiOutlineChatBubbleLeftRight, value: "5+ Channels", text: "WhatsApp, Telegram, IG, Web & FB" },
];

const openChat = () => document.querySelector<HTMLButtonElement>(".chat-toggle")?.click();

const Hero = ({ eyebrow, title, description, demoItems }: HeroProps) => {
    const [selectedChannel, setSelectedChannel] = useState(0);
    const [isHeroVisible, setIsHeroVisible] = useState(false);
    const [isManualSelection, setIsManualSelection] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const channel = heroChannels[selectedChannel];

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsHeroVisible(entry.isIntersecting);
            if (entry.isIntersecting) {
                setSelectedChannel(0);
                setIsManualSelection(false);
            }
        }, { threshold: 0.1 });

        observer.observe(hero);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isHeroVisible || isManualSelection) return;

        const interval = window.setInterval(() => {
            setSelectedChannel((current) => (current + 1) % heroChannels.length);
        }, 3000);

        return () => window.clearInterval(interval);
    }, [isHeroVisible, isManualSelection]);

    const selectChannel = (index: number) => {
        setSelectedChannel(index);
        setIsManualSelection(true);
    };

    return (
        <>
            <section className="relative mx-auto grid min-h-[calc(92vh_-_4rem)] w-[min(1280px,calc(100%_-_2rem))] grid-cols-[7fr_5fr] items-center gap-12 py-16 max-md:grid-cols-1" ref={heroRef}>
                <div className="pointer-events-none absolute inset-x-[-50vw] inset-y-0 -z-10 bg-[linear-gradient(var(--theme-accent-faint)_1px,transparent_1px),linear-gradient(90deg,var(--theme-accent-faint)_1px,transparent_1px)] bg-[size:36px_36px] opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" aria-hidden="true" />
                <div className="relative z-[1]">
                    <img className="absolute -right-14 -top-9 -z-10 w-40 rotate-[5deg] opacity-20 max-md:-right-4 max-md:-top-6 max-md:w-28" src="/airobot.png" alt="Vizr AI chatbot waving" />
                    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-accent-medium)] bg-[var(--theme-accent-faint)] px-4 py-2 text-xs font-extrabold tracking-wide text-accent [&_i]:h-2 [&_i]:w-2 [&_i]:animate-pulse [&_i]:rounded-full [&_i]:bg-primary"><i />{eyebrow}</span>
                    <h1 className="my-6 max-w-[680px] text-[clamp(2.25rem,5vw,3.75rem)] font-black leading-[1.15] tracking-[-.04em] text-foreground">{title}</h1>
                    <p className="max-w-[650px] text-lg leading-8 text-muted-foreground">{description}</p>
                    <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Preview channel">
                        {heroChannels.map((item, index) => (
                            <button
                                type="button"
                                role="tab"
                                aria-selected={selectedChannel === index}
                                onClick={() => selectChannel(index)}
                                className={`inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-bold text-muted-foreground transition ${selectedChannel === index ? `${item.pill} scale-105 !text-foreground` : ""}`}
                                key={item.name}
                            >
                                <PlatformIcon name={item.name} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link className="inline-flex rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground no-underline" to="/auth/register">Start Free Trial →</Link>
                        <button type="button" className="rounded-xl border border-border bg-transparent px-5 py-3 font-extrabold text-foreground" onClick={openChat}>Talk to the Demo Bot →</button>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-xs font-semibold text-muted-foreground [&_span]:flex [&_span]:items-center [&_span]:gap-2 [&_i]:h-2 [&_i]:w-2 [&_i]:rounded-full [&_i]:bg-primary [&_span:first-child_i]:bg-secondary">
                        <span><i /> &lt; 5s Average Reply</span>
                        <span><i /> Trained on Your Files</span>
                        <span><i /> Human Takeover Anytime</span>
                    </div>
                </div>
                <HeroProduct demoItems={demoItems} channel={channel} selectedChannel={selectedChannel} />
            </section>
            <aside className="relative z-[2] mx-auto -mt-8 mb-4 grid w-[min(1280px,calc(100%_-_2rem))] grid-cols-4 gap-4 rounded-2xl border border-border bg-surface/90 p-6 shadow-[var(--shadow)] backdrop-blur-2xl max-lg:grid-cols-2 max-sm:grid-cols-1 [&_article]:flex [&_article]:items-center [&_article]:gap-4 [&_article]:p-2 [&_article>i]:grid [&_article>i]:h-12 [&_article>i]:w-12 [&_article>i]:shrink-0 [&_article>i]:place-items-center [&_article>i]:rounded-2xl [&_article>i]:border [&_article>i]:border-border [&_article>i]:bg-[var(--theme-accent-faint)] [&_article>i]:text-primary [&_article>i]:not-italic [&_article>div]:grid [&_article>div]:gap-1 [&_small]:text-xs [&_small]:leading-5 [&_small]:text-muted-foreground" aria-label="Platform highlights">
                {highlights.map((item) => (
                    <article key={item.value}>
                        <i><item.Icon aria-hidden="true" /></i>
                        <div><strong>{item.value}</strong><small>{item.text}</small></div>
                    </article>
                ))}
            </aside>
        </>
    );
};

const HeroProduct = ({ demoItems, channel, selectedChannel }: {
    demoItems: LandingSectionItem[];
    channel: typeof heroChannels[number];
    selectedChannel: number;
}) => {
    const metrics = demoItems.slice(0, 3) as HeroMetricItem[];
    const messages = demoItems.slice(3) as ConversationItem[];

    return (
        <div className="grid w-full max-w-md place-self-center content-center gap-4">
            <div className="grid grid-cols-3 gap-3 [&_article]:rounded-2xl [&_article]:border [&_article]:border-border [&_article]:bg-surface-elevated [&_article]:p-4 [&_article]:text-center [&_strong]:block [&_strong]:text-xl [&_strong]:text-primary [&_small]:text-[.625rem] [&_small]:uppercase [&_small]:text-muted-foreground">
                {metrics.map((item) => (
                    <article key={item.label}>
                        <strong>{item.value}</strong>
                        <small>{item.label}</small>
                    </article>
                ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface pb-3 text-sm shadow-[var(--shadow)]" data-platform={channel.name}>
                <header className="flex justify-between border-b border-border p-4">
                    <strong className="flex items-center gap-3">
                        <img className="h-9 w-9 shrink-0 rounded-full bg-white p-1 object-contain" src="/robot.png" alt="" />
                        <div>
                            <span className="block">Vizr on </span>
                            <span>{channel.name}</span>
                        </div>
                    </strong>
                    <span className="rounded-full border border-success px-3 py-1 text-[.625rem] text-success">Active Sync</span>
                </header>
                <div className="" key={selectedChannel}>
                    {messages.map((item, index) => (
                        <p
                            className={`m-3 grid max-w-[85%] rounded-2xl bg-muted px-3 py-3 !text-sm text-white ${item.sender === "assistant" ? `ml-auto ${channel.message}` : ""}`}
                            key={index}
                        >
                            {item.description}
                            <small className="mt-2 text-right text-[.5625rem] opacity-65">{item.label.replace("Instagram", channel.name)}</small>
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;
