import pool from '../db';

export interface RankedUserRow {
  user_id: string;
  nickname: string;
  total_likes: number;
  post_count: number;
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

export interface UserRankRow {
  total_likes: number;
  post_count: number;
  rank: number;
}

export async function findCurrentMonthRanking(
  yearMonth: string
): Promise<RankedUserRow[]> {
  const result = await pool.query<RankedUserRow>(
    `WITH user_stats AS (
       SELECT p.author_id AS user_id, u.nickname,
              SUM(p.like_count)::int AS total_likes,
              COUNT(*)::int AS post_count
       FROM post p
       JOIN "user" u ON p.author_id = u.id
       WHERE TO_CHAR(p.created_at, 'YYYY-MM') = $1
       GROUP BY p.author_id, u.nickname
       HAVING SUM(p.like_count) > 0
     )
     SELECT *, ROW_NUMBER() OVER (ORDER BY total_likes DESC, post_count DESC)::int AS rank
     FROM user_stats
     ORDER BY total_likes DESC, post_count DESC`,
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

export async function findUserRank(
  userId: string,
  yearMonth: string
): Promise<UserRankRow | null> {
  const result = await pool.query<UserRankRow>(
    `WITH user_stats AS (
       SELECT p.author_id AS user_id,
              SUM(p.like_count)::int AS total_likes,
              COUNT(*)::int AS post_count
       FROM post p
       WHERE TO_CHAR(p.created_at, 'YYYY-MM') = $2
       GROUP BY p.author_id
     ),
     ranked AS (
       SELECT *, ROW_NUMBER() OVER (ORDER BY total_likes DESC, post_count DESC)::int AS rank
       FROM user_stats
     )
     SELECT total_likes, post_count, rank
     FROM ranked WHERE user_id = $1`,
    [userId, yearMonth]
  );
  return result.rows[0] || null;
}
