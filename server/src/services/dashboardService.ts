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

export async function getDashboard(userId?: string) {
  const yearMonth = getCurrentYearMonth();

  let nickname = '방문자';
  let myRankingResult = null;

  if (userId) {
    const user = await userRepository.findById(userId);
    if (user) {
      nickname = user.nickname;
      const rank = await dashboardRepository.findUserTipRank(userId, yearMonth);
      myRankingResult = rank ? { totalLikes: rank.total_likes, rank: rank.rank } : null;
    }
  }

  const [recentPosts, topRanking, upcomingMeetups, stats] = await Promise.all([
    dashboardRepository.findRecentPosts(5),
    dashboardRepository.findTopTipPostsForMonth(yearMonth, 3),
    dashboardRepository.findUpcomingMeetups(3),
    dashboardRepository.getCommunityStats(),
  ]);

  return {
    user: { nickname },
    recentPosts,
    topRanking,
    myRanking: myRankingResult,
    upcomingMeetups,
    stats: {
      userCount: stats.user_count,
      postCount: stats.post_count,
      meetupCount: stats.meetup_count,
    },
  };
}
