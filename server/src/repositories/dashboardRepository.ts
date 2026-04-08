import pool from '../db';

export interface RecentPostRow {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  created_at: Date;
}

export interface TipRankingRow {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
}

export interface UserTipRankRow {
  like_count: number;
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
    `SELECT p.id, p.title, u.nickname AS author_nickname, p.like_count
     FROM post p
     JOIN "user" u ON p.author_id = u.id
     WHERE p.is_tip_event = TRUE
       AND TO_CHAR(p.created_at, 'YYYY-MM') = $1
     ORDER BY p.like_count DESC, p.created_at ASC
     LIMIT $2`,
    [yearMonth, limit]
  );
  return result.rows;
}

export async function findUserTipRank(
  userId: string,
  yearMonth: string
): Promise<UserTipRankRow | null> {
  // Use a window function to rank all tip posts for the month,
  // then find the best rank among the user's posts
  const result = await pool.query<UserTipRankRow>(
    `WITH ranked AS (
       SELECT p.id, p.author_id, p.like_count,
              ROW_NUMBER() OVER (ORDER BY p.like_count DESC, p.created_at ASC) AS rank
       FROM post p
       WHERE p.is_tip_event = TRUE
         AND TO_CHAR(p.created_at, 'YYYY-MM') = $2
     )
     SELECT r.like_count, r.rank::int
     FROM ranked r
     WHERE r.author_id = $1
     ORDER BY r.rank ASC
     LIMIT 1`,
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
