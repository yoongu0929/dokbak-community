import pool from '../db';

export interface PostRow {
  id: string;
  author_id: string;
  title: string;
  content: string;
  is_tip_event: boolean;
  like_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostDetailRow extends PostRow {
  author_nickname: string;
  user_liked: boolean;
}

export interface PostListResult {
  posts: (PostRow & { author_nickname: string })[];
  total: number;
}

const PAGE_SIZE = 10;

export async function findAll(
  page: number,
  search?: string
): Promise<PostListResult> {
  const offset = (page - 1) * PAGE_SIZE;
  const params: unknown[] = [];
  let whereClause = '';

  if (search) {
    params.push(`%${search}%`);
    whereClause = `WHERE p.title ILIKE $1 OR p.content ILIKE $1`;
  }

  const countQuery = `SELECT COUNT(*) FROM post p ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataParams = [...params, PAGE_SIZE, offset];
  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  const dataQuery = `
    SELECT p.*, u.nickname AS author_nickname
    FROM post p
    JOIN "user" u ON p.author_id = u.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const dataResult = await pool.query(dataQuery, dataParams);
  return { posts: dataResult.rows, total };
}

export async function findById(
  postId: string,
  userId?: string
): Promise<PostDetailRow | null> {
  const result = await pool.query(
    `SELECT p.*, u.nickname AS author_nickname,
       CASE WHEN l.id IS NOT NULL THEN true ELSE false END AS user_liked
     FROM post p
     JOIN "user" u ON p.author_id = u.id
     LEFT JOIN "like" l ON l.post_id = p.id AND l.user_id = $2
     WHERE p.id = $1`,
    [postId, userId ?? null]
  );
  return result.rows[0] || null;
}

export async function create(
  authorId: string,
  title: string,
  content: string,
  isTipEvent: boolean
): Promise<PostRow> {
  const result = await pool.query<PostRow>(
    `INSERT INTO post (author_id, title, content, is_tip_event)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [authorId, title, content, isTipEvent]
  );
  return result.rows[0];
}

export async function update(
  postId: string,
  title: string,
  content: string,
  isTipEvent: boolean
): Promise<PostRow> {
  const result = await pool.query<PostRow>(
    `UPDATE post
     SET title = $2, content = $3, is_tip_event = $4, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [postId, title, content, isTipEvent]
  );
  return result.rows[0];
}

export async function remove(postId: string): Promise<void> {
  await pool.query('DELETE FROM post WHERE id = $1', [postId]);
}

export async function toggleLike(
  postId: string,
  userId: string
): Promise<{ liked: boolean; likeCount: number }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id FROM "like" WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    );

    let liked: boolean;
    if (existing.rows.length > 0) {
      await client.query(
        `DELETE FROM "like" WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );
      await client.query(
        `UPDATE post SET like_count = like_count - 1 WHERE id = $1`,
        [postId]
      );
      liked = false;
    } else {
      await client.query(
        `INSERT INTO "like" (user_id, post_id) VALUES ($1, $2)`,
        [userId, postId]
      );
      await client.query(
        `UPDATE post SET like_count = like_count + 1 WHERE id = $1`,
        [postId]
      );
      liked = true;
    }

    const countResult = await client.query(
      `SELECT like_count FROM post WHERE id = $1`,
      [postId]
    );

    await client.query('COMMIT');
    return { liked, likeCount: countResult.rows[0].like_count };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findAuthorId(postId: string): Promise<string | null> {
  const result = await pool.query(
    'SELECT author_id FROM post WHERE id = $1',
    [postId]
  );
  return result.rows[0]?.author_id || null;
}
