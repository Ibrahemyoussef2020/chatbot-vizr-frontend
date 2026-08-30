import { Link } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3 border-t border-border pt-7">
        <h2 className="text-xl font-black text-foreground">{title}</h2>
        <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
);

const PolicyTerms = () => (
    <main className="min-h-screen bg-main px-4 pb-20 pt-28 text-foreground sm:px-6">
        <div className="mx-auto max-w-4xl">
            <div className="mb-8 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
                <span className="text-xs font-extrabold uppercase tracking-[.2em] text-primary">Legal & privacy</span>
                <h1 className="mt-3 text-3xl font-black sm:text-5xl">Privacy Policy & Terms of Service</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">This page explains how Vizr handles information and the terms that apply when you use our AI chatbot platform.</p>
                <p className="mt-4 text-xs font-bold text-muted-foreground">Last updated: August 30, 2026</p>
            </div>
            <article className="space-y-7 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
                <Section title="1. Information we collect">
                    <p>We may collect account information such as your name, email address, workspace details, and information you submit through support or contact forms.</p>
                    <p>When you connect communication channels such as WhatsApp, we process message content, sender identifiers, delivery events, and configuration details needed to provide the service.</p>
                </Section>
                <Section title="2. How we use information">
                    <p>We use information to operate and secure Vizr, deliver messages, provide AI-assisted customer support, troubleshoot integrations, improve reliability, and comply with applicable law.</p>
                    <p>We do not sell personal information. Connected channel data is used only to provide and maintain the features requested by the workspace owner.</p>
                </Section>
                <Section title="3. Service providers and sharing">
                    <p>We may share limited information with infrastructure, database, AI, analytics, and communication providers when necessary to deliver the service. These providers process data under their own terms and security obligations.</p>
                    <p>WhatsApp and Meta data is processed according to the applicable Meta Platform Terms and WhatsApp Business policies.</p>
                </Section>
                <Section title="4. Retention, security, and your choices">
                    <p>We retain information only for as long as reasonably required to provide the service, meet security needs, resolve disputes, and satisfy legal obligations. We use reasonable safeguards, but no internet service can guarantee absolute security.</p>
                    <p>You may request access, correction, or deletion of your personal information. See our <Link className="font-bold text-primary hover:underline" to="/data-deletion">Data Deletion Instructions</Link>.</p>
                </Section>
                <Section title="5. Terms of service">
                    <p>You must use Vizr lawfully, protect your credentials, obtain any required customer consent, and follow the policies of connected services. You may not use Vizr for spam, fraud, harassment, unauthorized access, or illegal content.</p>
                    <p>The service is provided on an “as available” basis. Features may change as third-party APIs evolve. You remain responsible for reviewing AI-generated output and messages sent from your connected business accounts.</p>
                </Section>
                <Section title="6. Contact and updates">
                    <p>We may update this policy as the service changes. Material revisions will be reflected by the date shown above.</p>
                    <p>Questions or privacy requests can be sent to <a className="font-bold text-primary hover:underline" href="mailto:ibrahimyoussef.dev@gmail.com">ibrahimyoussef.dev@gmail.com</a>.</p>
                </Section>
            </article>
        </div>
    </main>
);

export default PolicyTerms;
