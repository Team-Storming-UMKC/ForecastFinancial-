export const inputSx = {
    borderRadius: "8px",
    color: "text.primary",
    bgcolor: "rgba(255,255,255,0.04)",

    // Base input padding
    "& .MuiOutlinedInput-input": {
        paddingLeft: "14px",
        paddingRight: "14px",
        paddingTop: "12px",
        paddingBottom: "12px",
    },

    // Remove extra right spacing ONLY when an endAdornment exists
    "&.MuiInputBase-adornedEnd": {
        pr: "6px", // small space between icon and right edge
    },
    "& .MuiOutlinedInput-inputAdornedEnd": {
        pr: "8px", // tiny breathing room after text before icon
    },

    // Tight adornment/icon spacing
    "& .MuiInputAdornment-root": {
        m: 0,
    },
    "& .MuiInputAdornment-positionEnd": {
        mr: 0,
    },
    "& .MuiIconButton-root": {
        m: 0,
        p: 0,
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
    "& .MuiOutlinedInput-input::placeholder": {
        color: "rgba(255,255,255,0.35)",
        opacity: 1,
    },
} as const;
