import pool from '../db';

export interface SuggestionRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: string;
  created_at: Date;
}

export async function create(userId: string, title: string, content: string): Promise<SuggestionRow> {
  const result = await pool.query<SuggestionRow>(
    `INSERT INTO suggestion (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
    [userId, title, content]
  );
  return result.rows[0];
}

export async function findAll(): Promise<(SuggestionRow & { nickname: string })[]> {
  const result = await pool.query(
    `SELECT s.*, u.nickname FROM suggestion s JOIN "user" u ON s.user_id = u.id ORDER BY s.created_at DESC`
  );
  return result.rows;
}

export async function findByUserId(userId: string): Promise<SuggestionRow[]> {
  const result = await pool.query<SuggestionRow>(
    `SELECT * FROM suggestion WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function updateStatus(id: string, status: string): Promise<void> {
  await pool.query(`UPDATE suggestion SET status = $2 WHERE id = $1`, [id, status]);
}
