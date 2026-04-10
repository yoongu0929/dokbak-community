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

export async function create(title: string, content: string, isPinned: boolean): Promise<NoticeRow> {
  const result = await pool.query<NoticeRow>(
    `INSERT INTO notice (title, content, is_pinned) VALUES ($1, $2, $3) RETURNING *`,
    [title, content, isPinned]
  );
  return result.rows[0];
}

export async function update(id: string, title: string, content: string, isPinned: boolean): Promise<NoticeRow> {
  const result = await pool.query<NoticeRow>(
    `UPDATE notice SET title = $2, content = $3, is_pinned = $4, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, title, content, isPinned]
  );
  return result.rows[0];
}

export async function remove(id: string): Promise<void> {
  await pool.query('DELETE FROM notice WHERE id = $1', [id]);
}
