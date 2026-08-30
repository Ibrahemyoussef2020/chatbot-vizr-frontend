import { HiOutlineChartBarSquare, HiOutlineLockClosed, HiOutlineSignal, HiOutlineUserGroup } from "react-icons/hi2";
import type { CardItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

const icons = [HiOutlineLockClosed, HiOutlineUserGroup, HiOutlineSignal, HiOutlineChartBarSquare];

export const TrustSection = ({ section }: SectionProps) => {
    const items = section.items as CardItem[];
    return (
        <section className="mx-auto w-[min(1280px,calc(100%_-_2rem))] border-t border-border py-24">
            <div className="mx-auto mb-12 max-w-3xl text-center">
                <span className="text-xs font-extrabold uppercase tracking-[.15em] text-accent">{section.eyebrow}</span>
                <h2 className="my-3 text-[clamp(1.875rem,4vw,3rem)] font-black leading-[1.15] text-foreground">{section.heading}</h2>
                <p className="leading-7 text-muted-foreground">{section.description}</p>
            </div>
            <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {items.map((item, index) => {
                    const Icon = icons[index % icons.length];
                    return (
                        <article className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary" key={item.title}>
                            <i className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--theme-accent-faint)] text-xl text-primary not-italic"><Icon aria-hidden="true" /></i>
                            <h3 className="mb-3 mt-5 text-lg font-black text-foreground">{item.title}</h3>
                            <p className="min-h-20 text-sm leading-7 text-muted-foreground">{item.description}</p>
                            <span className="text-xs font-bold text-secondary">Built in by default</span>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};
