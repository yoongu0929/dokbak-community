import pool from '../db';

const REWARD_TYPES: Record<number, string> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
};

function rewardDescription(yearMonth: string, rank: number): string {
  return `${yearMonth} 꿀팁 랭킹 ${rank}위 리워드`;
}

function getPreviousYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, so this is already "previous month"
  if (month === 0) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export async function finalizeMonthlyRanking(targetYearMonth?: string): Promise<{
  yearMonth: string;
  totalRanked: number;
  rewardsGiven: number;
}> {
  const yearMonth = targetYearMonth ?? getPreviousYearMonth();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if already finalized
    const existing = await client.query(
      `SELECT id FROM monthly_ranking WHERE year_month = $1 AND is_finalized = TRUE LIMIT 1`,
      [yearMonth]
    );
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      throw new Error(`${yearMonth} 랭킹은 이미 확정되었습니다`);
    }

    // Get all tip posts from the target month, ranked by like_count DESC, created_at ASC
    const postsResult = await client.query(
      `SELECT p.id AS post_id, p.author_id, p.like_count,
              ROW_NUMBER() OVER (ORDER BY p.like_count DESC, p.created_at ASC)::int AS rank
       FROM post p
       WHERE p.is_tip_event = TRUE
         AND TO_CHAR(p.created_at, 'YYYY-MM') = $1
       ORDER BY p.like_count DESC, p.created_at ASC`,
      [yearMonth]
    );

    const posts = postsResult.rows;

    // Insert ranking snapshots
    for (const post of posts) {
      await client.query(
        `INSERT INTO monthly_ranking (post_id, year_month, like_count, rank, is_finalized, finalized_at)
         VALUES ($1, $2, $3, $4, TRUE, NOW())`,
        [post.post_id, yearMonth, post.like_count, post.rank]
      );
    }

    // Create rewards for top 3
    let rewardsGiven = 0;
    const top3 = posts.filter((p: { rank: number }) => p.rank <= 3);

    for (const post of top3) {
      // Get the ranking_id we just inserted
      const rankingResult = await client.query(
        `SELECT id FROM monthly_ranking WHERE post_id = $1 AND year_month = $2`,
        [post.post_id, yearMonth]
      );
      const rankingId = rankingResult.rows[0].id;

      const rewardType = REWARD_TYPES[post.rank as number];
      const description = rewardDescription(yearMonth, post.rank as number);

      await client.query(
        `INSERT INTO reward (user_id, ranking_id, year_month, rank, reward_type, description)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [post.author_id, rankingId, yearMonth, post.rank, rewardType, description]
      );
      rewardsGiven++;
    }

    await client.query('COMMIT');

    return {
      yearMonth,
      totalRanked: posts.length,
      rewardsGiven,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
