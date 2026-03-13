// authStyles.ts — shared input sx across login & register
export const inputSx = {
    borderRadius: "8px",
    color: "text.primary",
    bgcolor: "rgba(255,255,255,0.04)",
    "& input": {
        paddingLeft: "14px",
        paddingRight: "0px",
        paddingTop: "12px",
        paddingBottom: "12px",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.12)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.25)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
    },
    "& input::placeholder": {
        color: "rgba(255,255,255,0.35)",
        opacity: 1,
    },
};