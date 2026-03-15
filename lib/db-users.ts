import { getSql } from "./db";

export type UserRow = { id: string; email: string; target_industry: string | null; created_at: Date; last_active_at: Date };

/** Get or create user by email. Returns app user UUID or null if no DB. */
export async function getOrCreateUserByEmail(email: string): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`INSERT INTO users (email) VALUES (${email})
    ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
    RETURNING id`;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as { id: string } | undefined)?.id ?? null;
}

/** Get user by email. Returns null if not found or no DB. */
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT id, email, target_industry, created_at, last_active_at FROM users WHERE email = ${email}`;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as UserRow | undefined) ?? null;
}

/** Update last_active_at for user. */
export async function touchUserLastActive(userId: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE users SET last_active_at = NOW() WHERE id = ${userId}`;
}
