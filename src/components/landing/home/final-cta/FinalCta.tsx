import { Link } from "react-router-dom";

const openChat = () => document.querySelector<HTMLButtonElement>(".chat-toggle")?.click();

const FinalCta = () => (
    <section className="mx-auto w-[min(900px,calc(100%_-_2rem))] py-20">
        <div className="flex items-start gap-8 overflow-hidden rounded-3xl border border-border bg-surface-muted p-8 shadow-[var(--shadow)] max-sm:flex-col">
            <img className="max-h-[300px] w-1/3 object-contain max-sm:w-full" src="/airobot.png" alt="Vizr chatbot" />
            <div className="relative">
                <h2 className="mb-4 text-[clamp(1.875rem,4vw,3rem)]">Ready to Automate Your Support?</h2>
            <p className="mb-8 max-w-xl leading-7 text-muted-foreground">Join hundreds of companies answering customer messages in seconds. 14-day free trial, no credit card required.</p>
            <div className="flex gap-2">
                <Link className="rounded-xl bg-primary px-5 py-3 font-extrabold text-primary-foreground no-underline" to="/auth/register">Start 14-Day Free Trial</Link>
                <button className="rounded-xl border border-border bg-transparent px-5 py-3 font-extrabold text-foreground" type="button" onClick={openChat}>Test Live AI Bot →</button>
            </div> 
            </div>
        </div>
    </section>
);

export default FinalCta;
