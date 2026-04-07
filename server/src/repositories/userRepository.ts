import pool from '../db';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  nickname: string;
  oauth_provider: string | null;
  oauth_id: string | null;
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

export async function findByOAuth(provider: string, oauthId: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT * FROM "user" WHERE oauth_provider = $1 AND oauth_id = $2',
    [provider, oauthId]
  );
  return result.rows[0] || null;
}

export async function createOAuthUser(
  email: string,
  nickname: string,
  provider: string,
  oauthId: string
): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO "user" (email, nickname, oauth_provider, oauth_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email, nickname, provider, oauthId]
  );
  return result.rows[0];
}
