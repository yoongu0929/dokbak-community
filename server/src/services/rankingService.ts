import * as rankingRepository from '../repositories/rankingRepository';

export class RankingError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'RankingError';
    this.statusCode = statusCode;
  }
}

function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function getCurrentRanking() {
  const yearMonth = getCurrentYearMonth();
  const rows = await rankingRepository.findCurrentMonthRanking(yearMonth);
  return {
    yearMonth,
    rankings: rows.map((r) => ({
      id: r.id,
      title: r.title,
      authorNickname: r.author_nickname,
      likeCount: r.like_count,
      createdAt: r.created_at,
      rank: r.rank,
    })),
  };
}

export async function getArchivedRanking(yearMonth: string) {
  if (!YEAR_MONTH_REGEX.test(yearMonth)) {
    throw new RankingError('올바른 형식이 아닙니다 (YYYY-MM)', 400);
  }

  const current = getCurrentYearMonth();
  if (yearMonth >= current) {
    throw new RankingError('아카이브는 과거 월만 조회할 수 있습니다', 400);
  }

  const rows = await rankingRepository.findArchivedRanking(yearMonth);
  return {
    yearMonth,
    rankings: rows.map((r) => ({
      id: r.id,
      postId: r.post_id,
      title: r.title,
      authorNickname: r.author_nickname,
      likeCount: r.like_count,
      rank: r.rank,
      finalizedAt: r.finalized_at,
    })),
  };
}

export async function getMyRanking(userId: string) {
  const yearMonth = getCurrentYearMonth();
  const rows = await rankingRepository.findUserRankedPosts(userId, yearMonth);
  return {
    yearMonth,
    posts: rows.map((r) => ({
      postId: r.post_id,
      title: r.title,
      likeCount: r.like_count,
      rank: r.rank,
      createdAt: r.created_at,
    })),
  };
}
