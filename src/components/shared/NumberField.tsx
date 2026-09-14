import { useRef } from "react";
import { IconButton, InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";

type Props = Omit<TextFieldProps, "type" | "onChange" | "slotProps"> & {
    min?: number;
    max?: number;
    step?: number;
    onValueChange: (value: string) => void;
};

const NumberField = ({ min, max, step = 1, onValueChange, ...props }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const adjust = (direction: number) => {
        const input = inputRef.current;
        if (!input) return;
        if (direction > 0) input.stepUp();
        else input.stepDown();
        onValueChange(input.value);
    };

    return (
        <TextField {...props} type="number" inputRef={inputRef} className="themed-number-field"
            onChange={event => onValueChange(event.target.value)}
            slotProps={{
                htmlInput: { min, max, step },
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <div className="flex flex-col">
                                <IconButton type="button" size="small" disabled={props.disabled}
                                    aria-label={`Increase ${props.label}`} onClick={() => adjust(1)}
                                    sx={{ padding: "1px", color: "var(--muted-foreground)" }}>
                                    <HiChevronUp size={16} />
                                </IconButton>
                                <IconButton type="button" size="small" disabled={props.disabled}
                                    aria-label={`Decrease ${props.label}`} onClick={() => adjust(-1)}
                                    sx={{ padding: "1px", color: "var(--muted-foreground)" }}>
                                    <HiChevronDown size={16} />
                                </IconButton>
                            </div>
                        </InputAdornment>
                    ),
                },
            }} />
    );
};

export default NumberField;
