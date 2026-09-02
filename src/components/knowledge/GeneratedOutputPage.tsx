import GeneratedSectionView from "./generated-output/GeneratedSectionView";
import OutputHeader from "./generated-output/OutputHeader";
import OutputNavigation from "./generated-output/OutputNavigation";
import type { GeneratedOutputKind } from "@/hooks/useGeneratedOutput";
import type { GeneratedOutput } from "@/services/knowledge/generatedOutputs";
import type { EditMode } from "@/services/knowledge/knowledgeOutputs";
import type { GeneratedSectionInput } from "@/services/knowledge/generatedOutputs";

interface GeneratedOutputPageProps {
    output: GeneratedOutput;
    sessionTitle: string;
    kind: GeneratedOutputKind;
    mutatingSchemaId: string;
    outputAction: string;
    onRetrySchema: (schemaId: string) => Promise<void>;
    onEditSchema: (schemaId: string, mode: EditMode, payload: GeneratedSectionInput | { instruction: string }) => Promise<void>;
    onRemoveSchema: (schemaId: string) => Promise<void>;
    onToggleSaved: () => Promise<void>;
    onRegenerate: () => Promise<void>;
    onShare: () => Promise<string | undefined>;
    onUnshare: () => Promise<void>;
}

const GeneratedOutputPage = ({ output, sessionTitle, kind, mutatingSchemaId, outputAction, onRetrySchema, onEditSchema, onRemoveSchema, onToggleSaved, onRegenerate, onShare, onUnshare }: GeneratedOutputPageProps) => (
    <div className="mx-auto w-full max-w-[1500px]">
        <OutputHeader output={output} sessionTitle={sessionTitle} kind={kind} action={outputAction} onToggleSaved={onToggleSaved} onRegenerate={onRegenerate} onShare={onShare} onUnshare={onUnshare} />
        <OutputNavigation sections={output.sections} kind={kind} />
        <div className="grid gap-5">
            {output.sections.map((section, index) => <GeneratedSectionView key={section.schemaId} section={section} index={index} busy={mutatingSchemaId === section.schemaId} onRetry={() => onRetrySchema(section.schemaId)} onEdit={(mode, payload) => onEditSchema(section.schemaId, mode, payload)} onRemove={() => onRemoveSchema(section.schemaId)} />)}
        </div>
    </div>
);

export default GeneratedOutputPage;
