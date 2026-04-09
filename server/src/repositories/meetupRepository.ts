import pool from '../db';

export interface MeetupRow {
  id: string;
  author_id: string;
  title: string;
  description: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  meet_date: Date;
  max_participants: number | null;
  age_category: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface MeetupDetailRow extends MeetupRow {
  author_nickname: string;
  rsvp_count: number;
  user_rsvp: string | null;
}

export interface RsvpRow {
  id: string;
  meetup_id: string;
  user_id: string;
  nickname: string;
  status: string;
  created_at: Date;
}

export async function findAll(status?: string): Promise<(MeetupRow & { author_nickname: string; rsvp_count: number })[]> {
  const params: unknown[] = [];
  let where = '';
  if (status) {
    params.push(status);
    where = `WHERE m.status = $1`;
  }
  const result = await pool.query(
    `SELECT m.*, u.nickname AS author_nickname,
       (SELECT COUNT(*)::int FROM meetup_rsvp r WHERE r.meetup_id = m.id AND r.status = 'attending') AS rsvp_count
     FROM meetup m JOIN "user" u ON m.author_id = u.id
     ${where} ORDER BY m.meet_date ASC`, params
  );
  return result.rows;
}

export async function findById(meetupId: string, userId?: string): Promise<MeetupDetailRow | null> {
  const result = await pool.query(
    `SELECT m.*, u.nickname AS author_nickname,
       (SELECT COUNT(*)::int FROM meetup_rsvp r WHERE r.meetup_id = m.id AND r.status = 'attending') AS rsvp_count,
       (SELECT r.status FROM meetup_rsvp r WHERE r.meetup_id = m.id AND r.user_id = $2) AS user_rsvp
     FROM meetup m JOIN "user" u ON m.author_id = u.id
     WHERE m.id = $1`,
    [meetupId, userId ?? null]
  );
  return result.rows[0] || null;
}

export async function getRsvps(meetupId: string): Promise<RsvpRow[]> {
  const result = await pool.query<RsvpRow>(
    `SELECT r.*, u.nickname FROM meetup_rsvp r
     JOIN "user" u ON r.user_id = u.id
     WHERE r.meetup_id = $1 ORDER BY r.created_at ASC`,
    [meetupId]
  );
  return result.rows;
}

export async function create(
  authorId: string, title: string, description: string,
  meetDate: string, locationName?: string | null,
  latitude?: number | null, longitude?: number | null,
  maxParticipants?: number | null, ageCategory?: string | null
): Promise<MeetupRow> {
  const result = await pool.query<MeetupRow>(
    `INSERT INTO meetup (author_id, title, description, meet_date, location_name, latitude, longitude, max_participants, age_category)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [authorId, title, description, meetDate, locationName ?? null, latitude ?? null, longitude ?? null, maxParticipants ?? null, ageCategory ?? null]
  );
  return result.rows[0];
}

export async function toggleRsvp(meetupId: string, userId: string): Promise<{ attending: boolean; rsvpCount: number }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      `SELECT id, status FROM meetup_rsvp WHERE meetup_id = $1 AND user_id = $2`,
      [meetupId, userId]
    );

    let attending: boolean;
    if (existing.rows.length > 0) {
      await client.query(`DELETE FROM meetup_rsvp WHERE meetup_id = $1 AND user_id = $2`, [meetupId, userId]);
      attending = false;
    } else {
      await client.query(
        `INSERT INTO meetup_rsvp (meetup_id, user_id, status) VALUES ($1, $2, 'attending')`,
        [meetupId, userId]
      );
      attending = true;
    }

    const countResult = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM meetup_rsvp WHERE meetup_id = $1 AND status = 'attending'`,
      [meetupId]
    );
    await client.query('COMMIT');
    return { attending, rsvpCount: countResult.rows[0].cnt };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function remove(meetupId: string): Promise<void> {
  await pool.query('DELETE FROM meetup WHERE id = $1', [meetupId]);
}

export async function findAuthorId(meetupId: string): Promise<string | null> {
  const result = await pool.query('SELECT author_id FROM meetup WHERE id = $1', [meetupId]);
  return result.rows[0]?.author_id || null;
}

export interface MeetupCommentRow {
  id: string;
  meetup_id: string;
  user_id: string;
  nickname: string;
  content: string;
  created_at: Date;
}

export async function isAttending(meetupId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT id FROM meetup_rsvp WHERE meetup_id = $1 AND user_id = $2 AND status = 'attending'`,
    [meetupId, userId]
  );
  return result.rows.length > 0;
}

export async function findComments(meetupId: string): Promise<MeetupCommentRow[]> {
  const result = await pool.query<MeetupCommentRow>(
    `SELECT c.*, u.nickname FROM meetup_comment c
     JOIN "user" u ON c.user_id = u.id
     WHERE c.meetup_id = $1 ORDER BY c.created_at ASC`,
    [meetupId]
  );
  return result.rows;
}

export async function createComment(meetupId: string, userId: string, content: string): Promise<MeetupCommentRow> {
  const result = await pool.query<MeetupCommentRow>(
    `INSERT INTO meetup_comment (meetup_id, user_id, content) VALUES ($1, $2, $3)
     RETURNING *, (SELECT nickname FROM "user" WHERE id = $2) AS nickname`,
    [meetupId, userId, content]
  );
  return result.rows[0];
}

export async function deleteComment(commentId: string): Promise<void> {
  await pool.query('DELETE FROM meetup_comment WHERE id = $1', [commentId]);
}

export async function findCommentAuthor(commentId: string): Promise<string | null> {
  const result = await pool.query('SELECT user_id FROM meetup_comment WHERE id = $1', [commentId]);
  return result.rows[0]?.user_id || null;
}
