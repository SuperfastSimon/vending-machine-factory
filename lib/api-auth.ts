import { prisma } from "@/lib/prisma";

/**
 * Authenticate a request using an API key from the Authorization header.
 * Returns the user ID if valid, or null if no valid key is provided.
 */
export async function authenticateApiKey(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(vmf_.+)$/);
  if (!match) return null;

  const apiKey = match[1];
  const user = await prisma.user.findUnique({
    where: { api_key: apiKey },
    select: { id: true },
  });

  return user?.id ?? null;
}
