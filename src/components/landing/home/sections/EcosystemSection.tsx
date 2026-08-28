import { Box, Typography } from "@mui/material";
import type { SectionProps } from "../../shared/types";
import PlatformIcon from "../../shared/PlatformIcon";

type EcosystemNode = { name: string; subtitle: string };

const entries: EcosystemNode[] = [
    { name: "WhatsApp", subtitle: "Official Business API" },
    { name: "Telegram", subtitle: "Automated Bots" },
    { name: "Website", subtitle: "Embedded Chat Widget" },
    { name: "Instagram", subtitle: "Direct Messages" },
    { name: "Messenger", subtitle: "Facebook Pages" },
];

const processes: EcosystemNode[] = [
    { name: "Human Handoff", subtitle: "Seamless escalation" },
    { name: "Control Center", subtitle: "Omnichannel view" },
    { name: "Smart Priority", subtitle: "Auto-tagging flow" },
];

const reliability: EcosystemNode[] = [
    { name: "Secure & Private", subtitle: "Namespace isolated" },
    { name: "HMAC Auth", subtitle: "Role-based access" },
    { name: "SLA Guarantee", subtitle: "Zero missed targets" },
];

export const EcosystemSection = ({ section }: SectionProps) => (
    <Box component="section" id="features" sx={{ width: "100%", px: { xs: 2, md: 3 }, py: { xs: 8, md: 12 }, bgcolor: "var(--background)" }}>
        <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", mb: { xs: 6, md: 9 }, textAlign: "center" }}>
            <Typography component="span" sx={{ color: "var(--accent)", fontSize: ".75rem", fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase" }}>{section.eyebrow}</Typography>
            <Typography component="h2" sx={{ m: 0, mt: 1.5, color: "var(--foreground)", fontSize: { xs: "2.25rem", md: "3.5rem" }, fontWeight: 900, lineHeight: 1.05 }}>Artistic Support Ecosystem</Typography>
            <Typography component="p" sx={{ maxWidth: 760, mx: "auto", mt: 2.5, mb: 0, color: "var(--muted-foreground)", fontSize: { xs: "1rem", md: "1.125rem" }, lineHeight: 1.7 }}>{section.description}</Typography>
        </Box>

        <Box sx={{ width: "100%", maxWidth: 1240, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(230px,1fr) 64px 260px 64px minmax(230px,1fr)" }, alignItems: "center", gap: { xs: 3, lg: 0 } }}>
            <EcosystemColumn title="Entry Points" nodes={entries} />
            <FlowConnector />

            <Box sx={{ position: "relative", zIndex: 1, width: { xs: 220, md: 260 }, height: { xs: 220, md: 260 }, mx: "auto", display: "grid", placeContent: "center", justifyItems: "center", gap: 1.25, px: 4, textAlign: "center", border: "2px solid var(--primary)", borderRadius: "50%", bgcolor: "var(--surface)" }}>
                <Typography component="span" sx={{ color: "var(--primary)", fontSize: "2.75rem", fontWeight: 900, lineHeight: 1 }}>AI</Typography>
                <Typography component="strong" sx={{ color: "var(--foreground)", fontSize: "1.35rem", fontWeight: 900 }}>AI Core</Typography>
                <Typography component="small" sx={{ maxWidth: 185, color: "var(--muted-foreground)", fontSize: ".75rem", lineHeight: 1.6 }}>Trained on your knowledge base and live product data.</Typography>
            </Box>

            <FlowConnector />
            <Box sx={{ display: "grid", gap: 3 }}>
                <EcosystemColumn title="Internal Process" nodes={processes} />
                <EcosystemColumn title="Core Reliability" nodes={reliability} />
            </Box>
        </Box>
    </Box>
);

const EcosystemColumn = ({ title, nodes }: { title: string; nodes: EcosystemNode[] }) => (
    <Box sx={{ minWidth: 0, display: "grid", gap: 1.25 }}>
        <Typography component="b" sx={{ mb: .5, color: "var(--primary)", fontSize: ".7rem", fontWeight: 900, letterSpacing: ".15em", textTransform: "uppercase" }}>{title}</Typography>
        {nodes.map((node) => (
            <Box component="article" key={node.name} sx={{ minWidth: 0, display: "grid", gridTemplateColumns: "42px minmax(0,1fr)", alignItems: "center", gap: 1.5, p: 1.5, border: "1px solid var(--border)", borderRadius: 0, bgcolor: "var(--surface)", boxShadow: "none", transition: "border-color .15s ease", "&:hover": { borderColor: "var(--primary)" } }}>
                <Box component="i" sx={{ width: 42, height: 42, display: "grid", placeItems: "center", bgcolor: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", fontStyle: "normal" }}><PlatformIcon name={node.name} /></Box>
                <Box sx={{ minWidth: 0, display: "grid", gap: .25 }}><Typography component="strong" noWrap sx={{ color: "var(--foreground)", fontSize: ".875rem", fontWeight: 800 }}>{node.name}</Typography><Typography component="small" noWrap sx={{ color: "var(--muted-foreground)", fontSize: ".7rem" }}>{node.subtitle}</Typography></Box>
            </Box>
        ))}
    </Box>
);

const FlowConnector = () => (
    <Box aria-hidden="true" sx={{ position: "relative", width: { xs: 2, lg: "100%" }, height: { xs: 44, lg: 2 }, mx: "auto", bgcolor: "var(--border)", "&::after": { content: '""', position: "absolute", right: { lg: 0 }, bottom: { xs: 0, lg: "auto" }, top: { lg: "50%" }, width: 8, height: 8, borderTop: "2px solid var(--primary)", borderRight: "2px solid var(--primary)", transform: { xs: "translateX(-3px) rotate(135deg)", lg: "translateY(-50%) rotate(45deg)" } } }} />
);
