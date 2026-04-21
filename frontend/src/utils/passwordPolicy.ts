export const PASSWORD_POLICY_MESSAGE =
  "Password must be at least 8 characters and include a letter, number, and special symbol.";

export function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function getPasswordStrength(password: string) {
  const checks = getPasswordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;

  if (!password) {
    return {
      checks,
      passed,
      label: "Enter a password",
      color: "rgba(255,255,255,0.24)",
      width: "0%",
    };
  }

  if (passed <= 1) {
    return {
      checks,
      passed,
      label: "Weak",
      color: "#ff6b6b",
      width: "25%",
    };
  }

  if (passed <= 3) {
    return {
      checks,
      passed,
      label: "Medium",
      color: "#ffb347",
      width: "65%",
    };
  }

  return {
    checks,
    passed,
    label: "Strong",
    color: "#5fd39a",
    width: "100%",
  };
}

export function validatePassword(password: string) {
  const checks = getPasswordChecks(password);

  if (checks.length && checks.letter && checks.number && checks.special) {
    return null;
  }

  return PASSWORD_POLICY_MESSAGE;
}
