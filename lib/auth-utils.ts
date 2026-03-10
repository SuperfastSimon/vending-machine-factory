/**
 * Converts raw Supabase auth error messages into user-friendly strings.
 * Centralised here so login, register, and forgot-password all behave
 * consistently and the mapping is independently unit-testable.
 */
export function friendlyAuthError(message: string): string {
  if (message === "Invalid API key")
    return "Service not configured. Please contact support.";
  if (message === "Failed to fetch")
    return "Unable to connect. Please check your internet connection and try again.";
  if (message === "Invalid login credentials")
    return "Incorrect email or password.";
  if (message === "User already registered")
    return "An account with this email already exists. Try signing in instead.";
  if (message === "Password should be at least 6 characters")
    return "Password must be at least 6 characters.";
  if (message === "Email not confirmed")
    return "Please check your inbox and confirm your email before signing in.";
  return message;
}
