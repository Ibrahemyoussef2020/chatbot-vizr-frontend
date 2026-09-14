import type { BusinessFeature, FeatureOptions } from "@/services/core/businessFeatures";

const PlanFeatureGroups = ({ bundles, options, showHeading = true }: {
    bundles: BusinessFeature[]; options: FeatureOptions; showHeading?: boolean;
}) => (
    <div className="grid gap-2">
        {bundles.map(bundle => (
            <section key={bundle._id} aria-label={bundle.name}>
                {showHeading && <>
                    <h3 className="mb-2 rounded-lg border border-border px-2 py-1 font-bold text-primary">{bundle.name}</h3>
                    {bundle.description && <p className="mb-1 text-xs text-muted-foreground">{bundle.description}</p>}
                </>}
                <ul className="list-none p-0 text-sm">
                    {options.metrics.map(metric => {
                        const value = bundle.quotas[metric.key];
                        const selected = value !== undefined && value !== 0;
                        const period = { per_second: "per second", per_day: "per day", per_month: "per month", total: "" }[metric.window];
                        const unit = metric.unit === "megabytes" ? "MB" : metric.unit;
                        const allowance = value === undefined ? "Not selected" : value === -1 ? "Unlimited" : value === 0 ? "Not included" : `${value.toLocaleString()} ${unit} ${period || ""}`.trim();
                        return <li key={metric.key} className="flex items-start gap-2 py-1">
                            <span aria-hidden="true" className={`mt-0.5 shrink-0 font-bold ${selected ? "text-primary" : "text-muted-foreground"}`}>{selected ? "\u2713" : "\u00d7"}</span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                                <span className={`font-semibold leading-5 ${selected ? "text-foreground" : "text-muted-foreground"}`}>{metric.label}:</span>
                                <span className="text-xs leading-5 text-muted-foreground">{allowance}</span>
                            </div>
                        </li>;
                    })}
                    {[...new Set([...options.agents.map(agent => agent.slug), ...bundle.agentSlugs])].map(slug => {
                        const selected = bundle.agentSlugs.includes(slug);
                        return <li key={`agent-${slug}`} className="flex items-start gap-2 py-1">
                            <span aria-hidden="true" className={`mt-0.5 shrink-0 font-bold ${selected ? "text-primary" : "text-muted-foreground"}`}>{selected ? "\u2713" : "\u00d7"}</span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                                <span className={`font-semibold leading-5 ${selected ? "text-foreground" : "text-muted-foreground"}`}>{options.agents.find(agent => agent.slug === slug)?.name || slug}:</span>
                                <span className="text-xs leading-5 text-muted-foreground">{selected ? "Included agent" : "Not selected"}</span>
                            </div>
                        </li>;
                    })}
                </ul>
            </section>
        ))}
    </div>
);

export default PlanFeatureGroups;
