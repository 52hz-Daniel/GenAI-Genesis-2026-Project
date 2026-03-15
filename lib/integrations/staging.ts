/**
 * Write raw scout output to opportunity_staging. Used by scout adapters.
 * Owner: Agent 1 (Integrations & profile data)
 */
import { getSql } from "../db";

export type StagingInsert = {
  source: string;
  url?: string | null;
  raw_text: string;
};

/**
 * Insert one raw opportunity into staging. Returns staging id or null.
 */
export async function insertStagingRow(row: StagingInsert): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  const result = await sql`
    INSERT INTO opportunity_staging (source, url, raw_text)
    VALUES (${row.source}, ${row.url ?? null}, ${row.raw_text})
    RETURNING id
  `;
  const r = Array.isArray(result) ? result[0] : result;
  return (r as { id: string } | undefined)?.id ?? null;
}

/**
 * Insert multiple rows. Returns count inserted.
 */
export async function insertStagingRows(rows: StagingInsert[]): Promise<number> {
  let count = 0;
  for (const row of rows) {
    const id = await insertStagingRow(row);
    if (id) count++;
  }
  return count;
}
