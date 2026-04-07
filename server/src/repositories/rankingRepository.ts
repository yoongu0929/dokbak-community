import pool from '../db';

export interface RankedTipPostRow {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  created_at: Date;
  rank: number;
}

export interface ArchivedRankingRow {
  id: string;
  post_id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  rank: number;
  finalized_at: Date;
}

export interface UserRankedPostRow {
  post_id: string;
  title: string;
  like_count: number;
  rank: number;
  created_at: Date;
}

export async function findCurrentMonthRanking(
  yearMonth: string
): Promise<RankedTipPostRow[]> {
  const result = await pool.query<RankedTipPostRow>(
    `SELECT p.id, p.title, u.nickname AS author_nickname, p.like_count, p.created_at,
            ROW_NUMBER() OVER (ORDER BY p.like_count DESC, p.created_at ASC)::int AS rank
     FROM post p
     JOIN "user" u ON p.author_id = u.id
     WHERE p.is_tip_event = TRUE
       AND TO_CHAR(p.created_at, 'YYYY-MM') = $1
     ORDER BY p.like_count DESC, p.created_at ASC`,
    [yearMonth]
  );
  return result.rows;
}

export async function findArchivedRanking(
  yearMonth: string
): Promise<ArchivedRankingRow[]> {
  const result = await pool.query<ArchivedRankingRow>(
    `SELECT mr.id, mr.post_id, p.title, u.nickname AS author_nickname,
            mr.like_count, mr.rank, mr.finalized_at
     FROM monthly_ranking mr
     JOIN post p ON mr.post_id = p.id
     JOIN "user" u ON p.author_id = u.id
     WHERE mr.year_month = $1
       AND mr.is_finalized = TRUE
     ORDER BY mr.rank ASC`,
    [yearMonth]
  );
  return result.rows;
}

export async function findUserRankedPosts(
  userId: string,
  yearMonth: string
): Promise<UserRankedPostRow[]> {
  const result = await pool.query<UserRankedPostRow>(
    `WITH ranked AS (
       SELECT p.id AS post_id, p.title, p.like_count, p.created_at, p.author_id,
              ROW_NUMBER() OVER (ORDER BY p.like_count DESC, p.created_at ASC)::int AS rank
       FROM post p
       WHERE p.is_tip_event = TRUE
         AND TO_CHAR(p.created_at, 'YYYY-MM') = $2
     )
     SELECT r.post_id, r.title, r.like_count, r.rank, r.created_at
     FROM ranked r
     WHERE r.author_id = $1
     ORDER BY r.rank ASC`,
    [userId, yearMonth]
  );
  return result.rows;
}
