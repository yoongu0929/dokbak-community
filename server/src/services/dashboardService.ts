import * as dashboardRepository from '../repositories/dashboardRepository';
import * as userRepository from '../repositories/userRepository';

export class DashboardError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'DashboardError';
    this.statusCode = statusCode;
  }
}

function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function getDashboard(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new DashboardError('사용자를 찾을 수 없습니다', 404);
  }

  const yearMonth = getCurrentYearMonth();

  const [recentPosts, topRanking, myRanking] = await Promise.all([
    dashboardRepository.findRecentPosts(5),
    dashboardRepository.findTopTipPostsForMonth(yearMonth, 3),
    dashboardRepository.findUserTipRank(userId, yearMonth),
  ]);

  return {
    user: { nickname: user.nickname },
    recentPosts,
    topRanking,
    myRanking: myRanking
      ? { likeCount: myRanking.like_count, rank: myRanking.rank }
      : null,
  };
}
