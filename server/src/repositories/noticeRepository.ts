import pool from '../db';

export interface NoticeRow {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function findAll(): Promise<NoticeRow[]> {
  const result = await pool.query<NoticeRow>(
    `SELECT * FROM notice ORDER BY is_pinned DESC, created_at DESC`
  );
  return result.rows;
}

export async function findById(id: string): Promise<NoticeRow | null> {
  const result = await pool.query<NoticeRow>(
    `SELECT * FROM notice WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}
