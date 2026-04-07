import pool from '../db';

export interface RewardRow {
  id: string;
  user_id: string;
  ranking_id: string;
  year_month: string;
  rank: number;
  reward_type: string;
  description: string;
  created_at: Date;
}

export async function findByUserId(userId: string): Promise<RewardRow[]> {
  const result = await pool.query<RewardRow>(
    `SELECT id, user_id, ranking_id, year_month, rank, reward_type, description, created_at
     FROM reward
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}
