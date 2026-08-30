import { Link } from "react-router-dom";
import type { CardItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

const getItems = (section: SectionProps["section"]) => section.items as CardItem[];

export const StepsSection = ({ section }: SectionProps) => (
    <section className="mx-auto w-[min(1280px,calc(100%_-_2rem))] border-t border-border py-24 text-center">
        <div className="mx-auto mb-12 max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-[.15em] text-accent">{section.eyebrow}</span>
            <h2 className="my-3 text-[clamp(1.875rem,4vw,3rem)] font-black leading-[1.15] text-foreground">{section.heading}</h2>
            <p className="mx-auto max-w-2xl leading-7 text-muted-foreground">Connect your customer touchpoints, add trusted content, then improve every answer from one workspace.</p>
        </div>
        <div className="relative mx-auto grid max-w-5xl grid-cols-3 gap-12 before:absolute before:left-[16%] before:right-[16%] before:top-8 before:h-0.5 before:bg-border max-md:grid-cols-1 max-md:gap-10 max-md:before:bottom-[16%] max-md:before:left-8 max-md:before:right-auto max-md:before:top-[16%] max-md:before:h-auto max-md:before:w-0.5">
            {getItems(section).map((item, index) => (
                <article className="relative grid content-start justify-items-center gap-3 max-md:grid-cols-[4rem_1fr] max-md:justify-items-start max-md:text-left" key={item.title}>
                    <div className="relative z-10 mb-2 grid h-16 w-16 place-items-center rounded-full border-2 border-primary bg-background text-xl font-black text-primary max-md:row-span-3">{item.number}</div>
                    <small className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Step {index + 1}</small>
                    <h3 className="m-0 text-xl font-black text-foreground">{item.title}</h3>
                    <p className="m-0 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </article>
            ))}
        </div>
        <div className="mt-12 grid justify-items-center gap-3 [&_small]:text-xs [&_small]:text-muted-foreground">
            <Link className="inline-flex rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground no-underline" to="#" onClick={() => document.querySelector<HTMLButtonElement>(".chat-toggle")?.click()}>
                Start chatbot speaking →
            </Link>
            <small>No credit card required Â· Launch in minutes</small>
        </div>
    </section>
);
