import * as React from "react";
import {
  IconButton,
  InputAdornment,
  OutlinedInput,
  OutlinedInputProps,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getAuthInputFieldStyles } from "@/components/auth/AuthInputField.styles";

interface AuthInputFieldProps extends Omit<OutlinedInputProps, "sx"> {
  withPasswordToggle?: boolean;
}

export default function AuthInputField({
  withPasswordToggle = false,
  type,
  ...props
}: AuthInputFieldProps) {
  const theme = useTheme();
  const styles = getAuthInputFieldStyles(theme);
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType = withPasswordToggle ? (showPassword ? "text" : "password") : type;

  return (
    <OutlinedInput
      fullWidth
      type={inputType}
      sx={styles.field}
      endAdornment={
        withPasswordToggle ? (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              edge="end"
            >
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ) : undefined
      }
      {...props}
    />
  );
}
