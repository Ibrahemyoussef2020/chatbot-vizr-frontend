import TextField from "@mui/material/TextField";

type Props = {
    name: string;
    type: string;
    label: string;
};
const CustomizedInput = (props: Props) => {
    return (
        <TextField
            margin="normal"
            name={props.name}
            label={props.label}
            type={props.type}
            slotProps={{
                inputLabel: {
                    style: { color: "var(--muted-foreground)" },
                },
                input: {
                    style: {
                        width: "400px",
                        borderRadius: 10,
                        fontSize: 20,
                        color: "var(--foreground)",
                    },
                },
            }}
            sx={{
                width: "400px",
                "& .MuiInputLabel-root": {
                    color: "var(--muted-foreground)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--foreground)",
                },
                "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    color: "var(--foreground)",
                    "& fieldset": {
                        borderColor: "var(--input)",
                    },
                    "&:hover fieldset": {
                        borderColor: "var(--foreground)",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "var(--ring)",
                    },
                },
                "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px var(--background) inset !important",
                    WebkitTextFillColor: "var(--foreground) !important",
                    caretColor: "var(--foreground)",
                },
            }}
        />
    );
};

export default CustomizedInput;
