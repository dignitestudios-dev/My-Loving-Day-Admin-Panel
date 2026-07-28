export const RESET_EMAIL_KEY = "resetEmail";
export const RESET_TOKEN_KEY = "resetToken";

export function clearResetSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESET_EMAIL_KEY);
  sessionStorage.removeItem(RESET_TOKEN_KEY);
  sessionStorage.removeItem("resetOtp");
}
