import { getSql } from "./db";

/** Get competency id by name. Returns null if not found or no DB. */
export async function getCompetencyIdByName(name: string): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = await sql`SELECT id FROM competencies WHERE name = ${name}`;
  const row = Array.isArray(rows) ? rows[0] : rows;
  return (row as { id: string } | undefined)?.id ?? null;
}
