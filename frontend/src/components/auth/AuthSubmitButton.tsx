import { Button, useTheme } from "@mui/material";
import { getAuthSubmitButtonStyles } from "@/components/auth/AuthSubmitButton.styles";

interface AuthSubmitButtonProps {
  label: string;
  loading?: boolean;
}

export default function AuthSubmitButton({ label, loading = false }: AuthSubmitButtonProps) {
  const theme = useTheme();
  const styles = getAuthSubmitButtonStyles(theme);

  return (
    <Button type="submit" variant="contained" sx={styles.root} disabled={loading}>
      {loading ? "Loading..." : label}
    </Button>
  );
}
