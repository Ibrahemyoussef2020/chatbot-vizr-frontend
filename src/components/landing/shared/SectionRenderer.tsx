import type { ContentSection } from "@/services/landing";
import type { ComponentType } from "react";
import {
    AnalyticsSection,
    BenefitsSection,
    CardSection,
    ChannelsSection,
    CommerceSection,
    ComparisonSection,
    EcosystemSection,
    ExplorerSection,
    IndustriesSection,
    JourneySection,
    RoiSection,
    StepsSection,
    TrustSection,
    WorkflowSection,
} from "../home/sections";

const sectionsByType: Record<string, ComponentType<{ section: ContentSection }>> = {
    analytics: AnalyticsSection,
    benefits: BenefitsSection,
    capabilities: ExplorerSection,
    channels: ChannelsSection,
    commerce: CommerceSection,
    comparison: ComparisonSection,
    ecosystem: EcosystemSection,
    industries: IndustriesSection,
    journey: JourneySection,
    roi: RoiSection,
    steps: StepsSection,
    trust: TrustSection,
    workflow: WorkflowSection,
};

const SectionRenderer = ({ section }: { section: ContentSection }) => {
    if (section.type === "heroDemo") return null;

    const Section = sectionsByType[section.type] || CardSection;
    return <Section section={section} />;
};

export default SectionRenderer;
