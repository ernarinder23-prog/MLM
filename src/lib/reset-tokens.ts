// In-memory store for password reset tokens
// In production, use Redis or database
export const resetTokens = new Map<
  string,
  { userId: string; expires: number }
>();
