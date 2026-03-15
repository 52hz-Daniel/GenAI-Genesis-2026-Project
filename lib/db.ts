/**
 * Postgres (Neon serverless) client for long-term memory.
 * Uses POSTGRES_URL or DATABASE_URL. If unset, getSql() returns null.
 * Use tagged template: const sql = getSql(); if (sql) await sql`SELECT * FROM t WHERE id = ${id}`;
 */
import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> | null {
  if (_sql) return _sql;
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) return null;
  _sql = neon(url);
  return _sql;
}

export function hasDb(): boolean {
  return !!getSql();
}

/**
 * Format a float array as pgvector literal for embedding column.
 * OpenAI text-embedding-3-small returns 1536 dimensions.
 */
export function embeddingToVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
