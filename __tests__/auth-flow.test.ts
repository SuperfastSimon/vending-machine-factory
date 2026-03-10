/**
 * Auth flow tests — covers:
 *   1. friendlyAuthError() — error message mapping used across all auth pages
 *   2. GET /auth/callback — email confirmation + OAuth code exchange
 *   3. POST /api/auth/logout — session teardown
 *
 * Server-side route handlers are tested directly (no browser needed).
 * Client-component logic is covered via the extracted friendlyAuthError utility.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Supabase mock — shared across callback + logout tests
// ---------------------------------------------------------------------------
const mockExchangeCodeForSession = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      signOut: mockSignOut,
    },
  })),
}));

// Import AFTER mocks are registered
import { friendlyAuthError } from "@/lib/auth-utils";
import { GET as callbackGET } from "@/app/(public)/auth/callback/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";

// ---------------------------------------------------------------------------
// 1. friendlyAuthError
// ---------------------------------------------------------------------------
describe("friendlyAuthError()", () => {
  it("maps 'Invalid API key' → service not configured message", () => {
    expect(friendlyAuthError("Invalid API key")).toBe(
      "Service not configured. Please contact support."
    );
  });

  it("maps 'Failed to fetch' → network error message", () => {
    expect(friendlyAuthError("Failed to fetch")).toBe(
      "Unable to connect. Please check your internet connection and try again."
    );
  });

  it("maps 'Invalid login credentials' → wrong email/password message", () => {
    expect(friendlyAuthError("Invalid login credentials")).toBe(
      "Incorrect email or password."
    );
  });

  it("maps 'User already registered' → duplicate account message", () => {
    expect(friendlyAuthError("User already registered")).toBe(
      "An account with this email already exists. Try signing in instead."
    );
  });

  it("maps 'Email not confirmed' → confirmation prompt", () => {
    expect(friendlyAuthError("Email not confirmed")).toBe(
      "Please check your inbox and confirm your email before signing in."
    );
  });

  it("maps 'Password should be at least 6 characters' → password length hint", () => {
    expect(friendlyAuthError("Password should be at least 6 characters")).toBe(
      "Password must be at least 6 characters."
    );
  });

  it("passes unknown errors through unchanged", () => {
    expect(friendlyAuthError("Some unexpected error from Supabase")).toBe(
      "Some unexpected error from Supabase"
    );
  });

  it("passes empty string through unchanged", () => {
    expect(friendlyAuthError("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 2. GET /auth/callback
// ---------------------------------------------------------------------------
describe("GET /auth/callback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /auth/login?error=missing_code when no code param", async () => {
    const req = new NextRequest("http://localhost:3000/auth/callback");
    const res = await callbackGET(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/auth/login");
    expect(location).toContain("error=missing_code");
  });

  it("calls exchangeCodeForSession with the correct code", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=test-code-abc"
    );
    await callbackGET(req);

    expect(mockExchangeCodeForSession).toHaveBeenCalledOnce();
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-code-abc");
  });

  it("redirects to /dashboard by default on successful exchange", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=valid-code"
    );
    const res = await callbackGET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("respects custom ?next= param after successful exchange", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=valid-code&next=/auth/reset-password"
    );
    const res = await callbackGET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/reset-password");
  });

  it("redirects to /auth/login with encoded error when exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "Token has expired or is invalid" },
    });
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=expired-code"
    );
    const res = await callbackGET(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/auth/login");
    expect(location).toContain("error=");
    // Error message should be URL-encoded in the redirect
    expect(location).toContain("Token");
  });

  it("URL-encodes special characters in the error redirect", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: "Invalid code: already used" },
    });
    const req = new NextRequest(
      "http://localhost:3000/auth/callback?code=reused-code"
    );
    const res = await callbackGET(req);

    const location = res.headers.get("location") ?? "";
    // Must not contain raw spaces or colons — they must be encoded
    expect(location).not.toMatch(/error=.+ .+/);
  });
});

// ---------------------------------------------------------------------------
// 3. POST /api/auth/logout
// ---------------------------------------------------------------------------
describe("POST /api/auth/logout", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls supabase.auth.signOut()", async () => {
    mockSignOut.mockResolvedValue({});
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    await logoutPOST(req);

    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("redirects to / after sign-out", async () => {
    mockSignOut.mockResolvedValue({});
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    const res = await logoutPOST(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("still redirects to / even if signOut returns an error", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "session not found" } });
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    const res = await logoutPOST(req);

    // Logout should always redirect home — never leave user stuck
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });
});
