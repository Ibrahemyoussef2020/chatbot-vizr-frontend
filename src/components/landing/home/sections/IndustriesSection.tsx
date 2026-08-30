import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { HiOutlineAcademicCap, HiOutlineBuildingStorefront, HiOutlineHeart, HiOutlineHomeModern } from "react-icons/hi2";
import type { IndustryItem } from "@/services/core/landing";
import type { SectionProps } from "../../shared/types";

const industryIcons = [HiOutlineBuildingStorefront, HiOutlineAcademicCap, HiOutlineHomeModern, HiOutlineHeart];

export const IndustriesSection = ({ section }: SectionProps) => {
    const items = section.items as IndustryItem[];
    const [selected, setSelected] = useState(0);
    const item = items[selected];
    const SelectedIcon = industryIcons[selected % industryIcons.length];

    return (
        <Box component="section" sx={{ width: "100%", bgcolor: "var(--surface-muted)", px: { xs: 2, md: 3 }, py: { xs: 8, md: 12 } }}>
            <Box sx={{ width: "100%", maxWidth: 1080, mx: "auto", mb: { xs: 6, md: 10 }, textAlign: "center" }}>
                <Typography component="h2" sx={{ m: 0, color: "var(--foreground)", fontSize: { xs: "2.25rem", md: "3.5rem", lg: "4.25rem" }, fontWeight: 900, lineHeight: .98, letterSpacing: "-.035em" }}>
                    {section.heading}
                </Typography>
                <Typography component="p" sx={{ maxWidth: 900, mx: "auto", mt: 3, mb: 0, color: "var(--muted-foreground)", fontSize: { xs: "1rem", md: "1.2rem" }, lineHeight: 1.7 }}>
                    {section.description}
                </Typography>
            </Box>

            <Box role="tablist" aria-label="Industries" sx={{ width: "100%", maxWidth: 1040, mx: "auto", mb: 6, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 1.5 }}>
                {items.map((industry, index) => {
                    const Icon = industryIcons[index % industryIcons.length];
                    const active = selected === index;
                    return (
                        <Button key={industry.code} role="tab" aria-selected={active} onClick={() => setSelected(index)} startIcon={<Icon />} sx={{ minHeight: 56, borderRadius: ".75rem", border: "1px solid", borderColor: active ? "var(--primary)" : "var(--border)", bgcolor: active ? "var(--primary)" : "var(--surface)", color: active ? "var(--primary-foreground)" : "var(--foreground)", px: 2, fontWeight: 800, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { bgcolor: active ? "var(--primary)" : "var(--surface)", borderColor: "var(--primary)", boxShadow: "none" } }}>
                            {industry.title}
                        </Button>
                    );
                })}
            </Box>

            <Box component="article" key={selected} sx={{ boxSizing: "border-box", width: "100%", maxWidth: 1120, minHeight: { lg: 390 }, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr .95fr" }, alignItems: "center", columnGap: 8, rowGap: 5, p: { xs: 3, md: 6 }, border: "1px solid var(--border)", borderRadius: "1.5rem", bgcolor: "var(--surface)", boxShadow: "none" }}>
                <Box sx={{ display: "grid", alignContent: "center", gap: 2.5, minWidth: 0 }}>
                    <Box component="span" sx={{ width: "fit-content", border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)", borderRadius: ".5rem", bgcolor: "color-mix(in srgb, var(--primary) 10%, transparent)", color: "var(--primary)", px: 2, py: 1, fontSize: ".75rem", fontWeight: 800 }}>{item.label}</Box>
                    <Typography component="h3" sx={{ m: 0, display: "flex", alignItems: "center", gap: 1.5, color: "var(--foreground)", fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 900 }}><SelectedIcon className="shrink-0 text-primary" />{item.title}</Typography>
                    <Typography component="p" sx={{ m: 0, maxWidth: 520, color: "var(--muted-foreground)", fontSize: "1rem", lineHeight: 1.9 }}>{item.description}</Typography>
                    <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>{item.tags.map((tag) => <Box component="small" key={tag} sx={{ border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)", borderRadius: ".5rem", bgcolor: "color-mix(in srgb, var(--primary) 5%, transparent)", color: "var(--foreground)", px: 1.5, py: 1, fontWeight: 600 }}>✓ {tag}</Box>)}</Box>
                </Box>

                <Box sx={{ minWidth: 0, display: "grid", gap: 2, p: { xs: 2, md: 3 }, border: "1px solid var(--border)", borderRadius: "1rem", bgcolor: "var(--surface)", boxShadow: "none" }}>
                    <Typography component="header" sx={{ pb: 2, borderBottom: "1px solid var(--border)", color: "var(--primary)", fontSize: ".75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".04em" }}>Simulated Conversation Flow</Typography>
                    <Box component="p" sx={{ m: 0, display: "grid", gap: .5, p: 2, borderRadius: ".75rem", bgcolor: "var(--surface-muted)", color: "var(--foreground)", fontSize: ".875rem", lineHeight: 1.6 }}><strong>Customer Inbound</strong>“{item.question}”</Box>
                    <Box component="p" sx={{ m: 0, display: "grid", gap: .5, p: 2, borderRadius: ".75rem", bgcolor: "var(--primary)", color: "var(--primary-foreground)", fontSize: ".875rem", lineHeight: 1.6 }}><strong>Vizr Answer (&lt;2s)</strong>“{item.answer}”</Box>
                </Box>
            </Box>
        </Box>
    );
};
