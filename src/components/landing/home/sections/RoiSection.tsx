import { sectionClass } from "../../shared/styles";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { RoiSettingItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

export const RoiSection = ({ section }: SectionProps) => {
    const config = section.items as RoiSettingItem[];
    const [queries, setQueries] = useState(Number(config[0]?.value || 5000));
    const [rate, setRate] = useState(Number(config[1]?.value || 25));
    const automation = Number(config[2]?.value || 84) / 100;
    const minutes = Number(config[3]?.value || 3.5);
    const hours = Math.round(queries * automation * minutes / 60);
    const savings = hours * rate * 12;

    return (
        <section className={sectionClass}>
            <div className="center-heading">
                <span className="eyebrow">{section.eyebrow}</span>
                <h2>{section.heading}</h2>
                <p>{section.description}</p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 rounded-2xl border border-border bg-surface p-10 max-lg:grid-cols-1">
                <div className="grid content-center gap-8 [&_label]:grid [&_label]:gap-3 [&_label]:text-muted-foreground [&_label>span]:flex [&_label>span]:items-center [&_label>span]:justify-between [&_label_strong]:text-lg [&_label_strong]:text-foreground [&_label>small]:flex [&_label>small]:justify-between [&_label_i]:not-italic [&_input]:w-full [&_input]:accent-primary [&>p]:m-0 [&>p]:text-sm [&>p]:leading-6 [&>p]:text-muted-foreground">
                    <RangeControl label="Monthly customer questions" value={queries.toLocaleString()} minLabel="500" maxLabel="25,000">
                        <input type="range" min="500" max="25000" step="500" value={queries} onChange={(event) => setQueries(Number(event.target.value))} />
                    </RangeControl>
                    <RangeControl label="Average support cost per hour" value={`$${rate}`} minLabel="$10" maxLabel="$100">
                        <input type="range" min="10" max="100" step="5" value={rate} onChange={(event) => setRate(Number(event.target.value))} />
                    </RangeControl>
                    <p>Based on an {Math.round(automation * 100)}% automation rate and {minutes} minutes saved per routine question.</p>
                </div>
                <div className="grid gap-4 rounded-2xl border border-border bg-surface-muted p-8 [&>small]:font-bold [&>small]:uppercase [&>small]:tracking-wider [&>small]:text-muted-foreground [&>strong]:text-[clamp(2rem,5vw,3.5rem)] [&>strong]:font-black [&>strong]:text-primary [&>div]:grid [&>div]:grid-cols-2 [&>div]:gap-3 [&_article]:grid [&_article]:gap-1 [&_article]:rounded-xl [&_article]:border [&_article]:border-border [&_article]:bg-surface [&_article]:p-4 [&_article_b]:text-xl [&_article_span]:text-sm [&_article_span]:text-muted-foreground [&>a]:mt-2 [&>a]:font-extrabold [&>a]:text-primary [&>a]:no-underline">
                    <small>Estimated annual savings</small>
                    <strong>{savings.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</strong>
                    <div>
                        <article><b>{hours} hrs</b><span>Freed per month</span></article>
                        <article><b>&lt; 5 sec</b><span>Average response</span></article>
                    </div>
                    <Link to="/auth/register">Start saving with Vizr →</Link>
                </div>
            </div>
        </section>
    );
};

type RangeControlProps = {
    label: string;
    value: string;
    minLabel: string;
    maxLabel: string;
    children: ReactNode;
};

const RangeControl = ({ label, value, minLabel, maxLabel, children }: RangeControlProps) => (
    <label>
        <span>{label}<strong>{value}</strong></span>
        {children}
        <small><i>{minLabel}</i><i>{maxLabel}</i></small>
    </label>
);
