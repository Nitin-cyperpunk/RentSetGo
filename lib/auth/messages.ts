export function loginBannerMessage(messageKey: string | undefined): {
  text: string | null;
  variant: "success" | "info" | "error";
} {
  if (messageKey === "check-email") {
    return {
      text: "Check your email to confirm your account, then sign in.",
      variant: "success",
    };
  }
  if (messageKey === "reset-session") {
    return {
      text: "Your password reset session expired. Request a new link from Forgot password.",
      variant: "info",
    };
  }
  if (messageKey === "auth-error") {
    return {
      text: "Sign-in was cancelled or failed. Please try again.",
      variant: "error",
    };
  }
  return { text: null, variant: "success" };
}
