import Button from "@mui/material/Button";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { HiOutlineArrowUpTray } from "react-icons/hi2";

interface Props {
    busy: boolean;
    onUpload: (files: File[]) => Promise<void>;
}

const accept = ".pdf,.xls,.xlsx,.csv,.txt,.md,.json,.xml,audio/*,video/*";

const SourceUploader = ({ busy, onUpload }: Props) => {
    const input = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const send = async (files: FileList | null) => {
        if (files?.length) await onUpload(Array.from(files).slice(0, 10));
        if (input.current) input.current.value = "";
    };

    const drop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        void send(event.dataTransfer.files);
    };

    return (
        <div
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-primary bg-primary/10" : "border-border bg-surface-muted"}`}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={drop}
        >
            <HiOutlineArrowUpTray className="mx-auto mb-2 text-3xl text-primary" />
            <p className="m-0 font-bold text-foreground">Drop knowledge files here</p>
            <p className="mb-4 mt-1 text-xs text-muted-foreground">PDF, text, Excel, audio, or video. Up to 10 files per upload.</p>
            <input ref={input} hidden type="file" multiple accept={accept} onChange={(event: ChangeEvent<HTMLInputElement>) => void send(event.target.files)} />
            <Button variant="contained" disabled={busy} onClick={() => input.current?.click()}>
                {busy ? "Processing..." : "Choose files"}
            </Button>
        </div>
    );
};

export default SourceUploader;
