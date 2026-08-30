import { Link } from "react-router-dom";

const DataDeletion = () => (
    <main className="min-h-screen bg-main px-4 pb-20 pt-28 text-foreground sm:px-6">
        <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10">
                <span className="text-xs font-extrabold uppercase tracking-[.2em] text-primary">Privacy request</span>
                <h1 className="mt-3 text-3xl font-black sm:text-5xl">User Data Deletion</h1>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">You can request deletion of personal information associated with your Vizr account or communications processed by a Vizr workspace.</p>
                <div className="mt-8 space-y-6 border-t border-border pt-8">
                    <div>
                        <h2 className="text-lg font-black">How to submit a request</h2>
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
                            <li>Email <a className="font-bold text-primary hover:underline" href="mailto:ibrahimyoussef.dev@gmail.com?subject=Vizr%20Data%20Deletion%20Request">ibrahimyoussef.dev@gmail.com</a> with the subject “Vizr Data Deletion Request”.</li>
                            <li>Include the email address or phone number associated with the data and, if known, the relevant workspace name.</li>
                            <li>We may ask for limited information to verify that you are authorized to make the request.</li>
                        </ol>
                    </div>
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                        <h2 className="text-sm font-black">What happens next?</h2>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">We will confirm receipt, review the request, and delete or anonymize eligible information. Some records may be retained where required for security, fraud prevention, dispute resolution, or legal compliance.</p>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">For more information, read our <Link className="font-bold text-primary hover:underline" to="/policy-terms">Privacy Policy and Terms of Service</Link>.</p>
                </div>
            </div>
        </div>
    </main>
);

export default DataDeletion;
