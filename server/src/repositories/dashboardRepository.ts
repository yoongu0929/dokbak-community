import pool from '../db';

export interface RecentPostRow {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  created_at: Date;
}

export interface TipRankingRow {
  user_id: string;
  nickname: string;
  total_likes: number;
}

export interface UserTipRankRow {
  total_likes: number;
  rank: number;
}

export async function findRecentPosts(limit: number): Promise<RecentPostRow[]> {
  const result = await pool.query<RecentPostRow>(
    `SELECT p.id, p.title, u.nickname AS author_nickname, p.like_count, p.created_at
     FROM post p
     JOIN "user" u ON p.author_id = u.id
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function findTopTipPostsForMonth(
  yearMonth: string,
  limit: number
): Promise<TipRankingRow[]> {
  const result = await pool.query<TipRankingRow>(
    `SELECT p.author_id AS user_id, u.nickname, SUM(p.like_count)::int AS total_likes
     FROM post p
     JOIN "user" u ON p.author_id = u.id
     WHERE TO_CHAR(p.created_at, 'YYYY-MM') = $1
     GROUP BY p.author_id, u.nickname
     HAVING SUM(p.like_count) > 0
     ORDER BY total_likes DESC
     LIMIT $2`,
    [yearMonth, limit]
  );
  return result.rows;
}

export async function findUserTipRank(
  userId: string,
  yearMonth: string
): Promise<UserTipRankRow | null> {
  const result = await pool.query<UserTipRankRow>(
    `WITH user_stats AS (
       SELECT p.author_id AS user_id, SUM(p.like_count)::int AS total_likes
       FROM post p
       WHERE TO_CHAR(p.created_at, 'YYYY-MM') = $2
       GROUP BY p.author_id
     ),
     ranked AS (
       SELECT *, ROW_NUMBER() OVER (ORDER BY total_likes DESC)::int AS rank
       FROM user_stats
     )
     SELECT total_likes, rank FROM ranked WHERE user_id = $1`,
    [userId, yearMonth]
  );
  return result.rows[0] || null;
}

export interface UpcomingMeetupRow {
  id: string;
  title: string;
  author_nickname: string;
  meet_date: Date;
  location_name: string | null;
  rsvp_count: number;
}

export async function findUpcomingMeetups(limit: number): Promise<UpcomingMeetupRow[]> {
  const result = await pool.query<UpcomingMeetupRow>(
    `SELECT m.id, m.title, u.nickname AS author_nickname, m.meet_date, m.location_name,
       (SELECT COUNT(*)::int FROM meetup_rsvp r WHERE r.meetup_id = m.id AND r.status = 'attending') AS rsvp_count
     FROM meetup m
     JOIN "user" u ON m.author_id = u.id
     WHERE m.status = 'open' AND m.meet_date >= NOW()
     ORDER BY m.meet_date ASC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}
