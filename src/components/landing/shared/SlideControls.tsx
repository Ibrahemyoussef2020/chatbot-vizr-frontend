type SlideControlsProps = {
    current: number;
    count: number;
    onChange: (index: number) => void;
    className?: string;
};

const SlideControls = ({ current, count, onChange, className = "" }: SlideControlsProps) => {
    const move = (step: number) => {
        onChange((current + step + count) % count);
    };

    return (
        <div className={`mx-auto mt-5 flex w-full items-center justify-end gap-3 text-foreground ${className}`} aria-label="Slide controls">
            <button className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface p-0 text-inherit transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground active:translate-y-0 active:scale-95" type="button" onClick={() => move(-1)} aria-label="Show previous slide">
                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                </svg>
            </button>
            <span className="min-w-12 text-center text-sm font-semibold text-muted-foreground" aria-live="polite">{current + 1} / {count}</span>
            <button className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface p-0 text-inherit transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground active:translate-y-0 active:scale-95" type="button" onClick={() => move(1)} aria-label="Show next slide">
                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>
        </div>
    );
};

export default SlideControls;
