import { sectionClass } from "../../shared/styles";
import type { SectionProps } from "../../shared/types";
import PlatformIcon from "../../shared/PlatformIcon";

const workflowChannels = [
    { name: "WhatsApp" },
    { name: "Telegram" },
    { name: "Instagram" },
    { name: "Website" },
    { name: "Messenger" },
];

export const WorkflowSection = ({ section }: SectionProps) => (
    <section className={sectionClass}>
        <div className="center-heading">
            <span className="eyebrow">{section.eyebrow}</span>
            <h2>{section.heading}</h2>
            <p>{section.description}</p>
        </div>
        <div className="mx-auto grid max-w-4xl justify-items-center gap-4 text-center">
            <b className="rounded-full border border-border bg-surface px-5 py-2 text-xs uppercase tracking-widest text-primary">1. Inbound Channels</b>
            <div className="grid w-full grid-cols-5 gap-3 max-lg:grid-cols-2 [&_strong]:grid [&_strong]:justify-items-center [&_strong]:gap-2 [&_strong]:rounded-xl [&_strong]:border [&_strong]:border-border [&_strong]:bg-surface [&_strong]:p-4 [&_strong]:text-foreground [&_i]:grid [&_i]:h-10 [&_i]:w-10 [&_i]:place-items-center [&_i]:rounded-xl [&_i]:bg-primary/10 [&_i]:text-primary [&_small]:font-medium [&_small]:text-muted-foreground">
                {workflowChannels.map((item) => (
                    <strong key={item.name}>
                        <i><PlatformIcon name={item.name} /></i>
                        {item.name}
                        <small>Automated</small>
                    </strong>
                ))}
            </div>
            <FlowArrow />
            <div className="grid w-[min(600px,100%)] gap-2 rounded-2xl border-2 border-primary bg-surface p-6">
                <strong className="text-lg font-black text-foreground">Vizr Private AI Core (RAG)</strong>
                <small className="leading-6 text-muted-foreground">Vector similarity retrieval over corporate PDFs, FAQs, Notion docs and live website content.</small>
            </div>
            <FlowArrow />
            <div className="grid w-[min(700px,100%)] grid-cols-2 gap-4 max-sm:grid-cols-1 [&>strong]:grid [&>strong]:gap-2 [&>strong]:rounded-xl [&>strong]:border [&>strong]:border-border [&>strong]:bg-surface [&>strong]:p-4 [&_b]:text-foreground [&_small]:font-medium [&_small]:leading-5 [&_small]:text-muted-foreground">
                <strong><b>84% Auto-Resolution</b><small>Direct instant answer delivered back to the customer</small></strong>
                <strong><b>16% Supervisor Takeover</b><small>Instant alert with full context for a one-click reply</small></strong>
            </div>
            <b className="mt-3 rounded-full bg-primary px-5 py-3 text-xs text-primary-foreground">✓ Threads Resolved & Saved to Analytics</b>
        </div>
    </section>
);

const FlowArrow = () => <div className="grid justify-items-center text-primary" aria-hidden="true"><i className="h-8 w-0.5 bg-primary" /><span className="-mt-1 text-xs">▼</span></div>;
