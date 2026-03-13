/**
 * Converts raw Supabase auth error messages into user-friendly strings.
 * Centralised here so login, register, forgot-password, and reset-password
 * all behave consistently. The mapping is independently unit-testable.
 */

const AUTH_ERROR_MAP = new Map<string, string>([
  ["Invalid API key", "Service not configured. Please contact support."],
  ["Failed to fetch", "Unable to connect. Please check your internet connection and try again."],
  ["Invalid login credentials", "Incorrect email or password."],
  ["User already registered", "An account with this email already exists. Try signing in instead."],
  ["Password should be at least 6 characters", "Password must be at least 8 characters."],
  ["Email not confirmed", "Please check your inbox and confirm your email before signing in."],
]);

export function friendlyAuthError(message: string): string {
  return AUTH_ERROR_MAP.get(message) ?? message;
}
