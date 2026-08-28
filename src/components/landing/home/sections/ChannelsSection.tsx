import { sectionClass } from "../../shared/styles";
import { useState } from "react";
import { Link } from "react-router-dom";
import PlatformIcon from "../../shared/PlatformIcon";
import SlideControls from "../../shared/SlideControls";
import type { SectionProps } from "../../shared/types";

const channelDetails = [
    { color: "#25d366", label: "WhatsApp Business", title: "Support customers where conversations already happen.", text: "Answer product questions, share order updates and hand conversations to your team with the full WhatsApp history attached." },
    { color: "#29b6f6", label: "Telegram", title: "Turn your Telegram bot into a trained assistant.", text: "Resolve common questions instantly, capture leads and escalate complex conversations without losing customer context." },
    { color: "#e1306c", label: "Instagram", title: "Convert Instagram messages into customer outcomes.", text: "Respond to DMs with product knowledge, qualification flows and fast human takeover from the same workspace." },
    { color: "#0084ff", label: "Messenger", title: "Keep Facebook conversations fast and connected.", text: "Automate first responses, recognize returning customers and route conversations to the right teammate." },
    { color: "#078ea4", label: "Email", title: "Bring structured AI assistance to the inbox.", text: "Draft grounded replies, preserve long-form context and coordinate ownership across support and sales teams." },
    { color: "#00b9eb", label: "Web Chat", title: "Help every website visitor in real time.", text: "Use your approved knowledge to answer questions, capture intent and move qualified visitors toward the next action." },
];

export const ChannelsSection = ({ section }: SectionProps) => {
    const names = section.items as string[];
    const [selected, setSelected] = useState(0);
    const active = channelDetails[selected];

    return (
        <section className={sectionClass} id="channels">
            <div className="mx-auto mb-8 max-w-3xl text-center [&_p]:leading-7 [&_p]:text-muted-foreground">
                <span className="eyebrow">Omnichannel</span>
                <h2>{section.heading}</h2>
                <p>One trained assistant, connected customer history and a seamless human handoff across every touchpoint.</p>
            </div>
            <div className="mb-5 flex flex-wrap justify-center gap-3 [&_button]:inline-flex [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-xl [&_button]:border [&_button]:border-border [&_button]:bg-surface [&_button]:px-4 [&_button]:py-3 [&_button]:text-sm [&_button]:font-extrabold [&_button]:text-muted-foreground" role="tablist" aria-label="Customer channels">
                {names.map((name, index) => (
                    <button
                        type="button"
                        role="tab"
                        aria-selected={selected === index}
                        onClick={() => setSelected(index)}
                        style={selected === index ? { borderColor: channelDetails[index]?.color, color: channelDetails[index]?.color } : undefined}
                        key={name}
                    >
                        <PlatformIcon name={name} />
                        <span>{name}</span>
                    </button>
                ))}
            </div>
            <div key={selected}>
                <article className="mx-auto grid min-h-64 max-w-4xl grid-cols-[auto_1fr_.75fr] items-center gap-8 rounded-3xl border border-border bg-surface p-8 max-sm:grid-cols-1" data-platform={active.label}>
                    <div className="grid h-16 w-16 place-items-center rounded-2xl text-2xl text-white" style={{ backgroundColor: active.color }}>
                        <PlatformIcon name={active.label} />
                    </div>
                    <div className="grid gap-3">
                        <span className="text-xs font-extrabold uppercase tracking-[0.14em]" style={{ color: active.color }}>{active.label}</span>
                        <h3 className="m-0 text-2xl font-black leading-tight text-foreground">{active.title}</h3>
                        <p className="m-0 leading-7 text-muted-foreground">{active.text}</p>
                        <Link className="inline-flex rounded-xl px-5 py-3 text-sm font-extrabold text-white no-underline" style={{ backgroundColor: active.color }} to="/auth/register">
                            Connect {active.label} →
                        </Link>
                    </div>
                    <ul className="m-0 grid list-none gap-3 p-0 text-sm font-bold text-foreground [&_li]:flex [&_li]:gap-2 [&_li]:before:text-success [&_li]:before:content-['✓']"><li>Instant AI replies</li><li>Shared customer context</li><li>One-click human takeover</li></ul>
                </article>
            <SlideControls className="max-w-4xl" current={selected} count={names.length} onChange={setSelected} />
            </div>
          
        </section>
    );
};
