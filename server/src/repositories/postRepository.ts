import pool from '../db';

export interface PostRow {
  id: string;
  author_id: string;
  title: string;
  content: string;
  is_tip_event: boolean;
  like_count: number;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[];
  age_category: string | null;
  has_nursing_room: boolean;
  has_diaper_station: boolean;
  has_stroller_access: boolean;
  has_kids_menu: boolean;
  has_playground: boolean;
  cleanliness_rating: number | null;
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
  search?: string,
  ageCategory?: string
): Promise<PostListResult> {
  const offset = (page - 1) * PAGE_SIZE;
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`);
  }

  if (ageCategory) {
    params.push(ageCategory);
    conditions.push(`p.age_category = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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
  authorId: string, title: string, content: string, isTipEvent: boolean,
  locationName?: string | null, latitude?: number | null, longitude?: number | null,
  imageUrls?: string[], ageCategory?: string | null,
  facilities?: { hasNursingRoom?: boolean; hasDiaperStation?: boolean; hasStrollerAccess?: boolean; hasKidsMenu?: boolean; hasPlayground?: boolean; cleanlinessRating?: number | null }
): Promise<PostRow> {
  const f = facilities || {};
  const result = await pool.query<PostRow>(
    `INSERT INTO post (author_id, title, content, is_tip_event, location_name, latitude, longitude, image_urls, age_category, has_nursing_room, has_diaper_station, has_stroller_access, has_kids_menu, has_playground, cleanliness_rating)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [authorId, title, content, isTipEvent, locationName ?? null, latitude ?? null, longitude ?? null, JSON.stringify(imageUrls ?? []), ageCategory ?? null, f.hasNursingRoom ?? false, f.hasDiaperStation ?? false, f.hasStrollerAccess ?? false, f.hasKidsMenu ?? false, f.hasPlayground ?? false, f.cleanlinessRating ?? null]
  );
  return result.rows[0];
}

export async function update(
  postId: string, title: string, content: string, isTipEvent: boolean,
  locationName?: string | null, latitude?: number | null, longitude?: number | null,
  imageUrls?: string[], ageCategory?: string | null,
  facilities?: { hasNursingRoom?: boolean; hasDiaperStation?: boolean; hasStrollerAccess?: boolean; hasKidsMenu?: boolean; hasPlayground?: boolean; cleanlinessRating?: number | null }
): Promise<PostRow> {
  const f = facilities || {};
  const result = await pool.query<PostRow>(
    `UPDATE post
     SET title = $2, content = $3, is_tip_event = $4, location_name = $5, latitude = $6, longitude = $7, image_urls = $8::jsonb, age_category = $9, has_nursing_room = $10, has_diaper_station = $11, has_stroller_access = $12, has_kids_menu = $13, has_playground = $14, cleanliness_rating = $15, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [postId, title, content, isTipEvent, locationName ?? null, latitude ?? null, longitude ?? null, JSON.stringify(imageUrls ?? []), ageCategory ?? null, f.hasNursingRoom ?? false, f.hasDiaperStation ?? false, f.hasStrollerAccess ?? false, f.hasKidsMenu ?? false, f.hasPlayground ?? false, f.cleanlinessRating ?? null]
  );
  return result.rows[0];
}

export async function remove(postId: string): Promise<string[]> {
  const result = await pool.query<{ image_urls: string[] }>(
    'DELETE FROM post WHERE id = $1 RETURNING image_urls',
    [postId]
  );
  return result.rows[0]?.image_urls ?? [];
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
