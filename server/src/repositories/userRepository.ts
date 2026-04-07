import pool from '../db';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  created_at: Date;
  updated_at: Date;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT * FROM "user" WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT * FROM "user" WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function create(
  email: string,
  passwordHash: string,
  nickname: string
): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO "user" (email, password_hash, nickname)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, passwordHash, nickname]
  );
  return result.rows[0];
}
