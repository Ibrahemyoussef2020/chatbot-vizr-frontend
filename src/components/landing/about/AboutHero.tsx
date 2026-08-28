interface AboutHeroProps {
    eyebrow?: string;
    title: string;
    description?: string;
}

const AboutHero = ({ eyebrow, title, description }: AboutHeroProps) => (
    <section className="grid gap-10 border-b border-border pb-16 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end" aria-labelledby="about-title">
        <div>
            {eyebrow && <span className="text-xs font-extrabold uppercase tracking-[.16em] text-accent">{eyebrow}</span>}
            <h1 className="mb-6 mt-5 max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.02] tracking-[-.04em] text-foreground" id="about-title">{title}</h1>
            {description && <p className="mb-0 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>}
        </div>
        <div className="grid gap-3 border-l border-border pl-6 [&>span]:flex [&>span]:items-center [&>span]:gap-3 [&>span]:text-sm [&>span]:font-bold [&_b]:text-primary">
            <span><b>01</b> Private by design</span>
            <span><b>02</b> Human-owned outcomes</span>
            <span><b>03</b> Built for real operations</span>
        </div>
    </section>
);

export default AboutHero;
