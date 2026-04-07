import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import styles from './MyPage.module.css';

interface MyRankingPost {
  postId: string;
  title: string;
  likeCount: number;
  rank: number;
  createdAt: string;
}

interface MyRankingData {
  yearMonth: string;
  posts: MyRankingPost[];
}

interface Reward {
  id: string;
  yearMonth: string;
  rank: number;
  rewardType: string;
  description: string;
  createdAt: string;
}

interface RewardData {
  rewards: Reward[];
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${year}년 ${parseInt(month, 10)}월`;
}

export default function MyPage() {
  const { user } = useAuth();
  const [myRanking, setMyRanking] = useState<MyRankingData | null>(null);
  const [rewards, setRewards] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [rankingRes, rewardRes] = await Promise.all([
          apiClient.get('/ranking/my'),
          apiClient.get('/rewards/my'),
        ]);
        if (!cancelled) {
          setMyRanking(rankingRes.data);
          setRewards(rewardRes.data);
        }
      } catch {
        if (!cancelled) setError('데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{user?.nickname ?? ''}님의 마이페이지</h1>

        {/* 이번 달 내 꿀팁 순위 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🍯 이번 달 내 꿀팁 순위</h2>
          {myRanking && myRanking.posts.length > 0 ? (
            <>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.5rem' }}>
                {formatYearMonth(myRanking.yearMonth)}
              </p>
              <div className={styles.postList}>
                {myRanking.posts.map((post) => (
                  <div key={post.postId} className={styles.postItem}>
                    <span className={styles.postTitle}>
                      {RANK_MEDALS[post.rank] ?? `${post.rank}위`} {post.title}
                    </span>
                    <span className={styles.postMeta}>
                      <span>❤️ {post.likeCount}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>이번 달 꿀팁 이벤트에 참여한 게시글이 없습니다.</p>
          )}
        </section>

        {/* 리워드 내역 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎁 리워드 내역</h2>
          {rewards && rewards.rewards.length > 0 ? (
            <div className={styles.rewardList}>
              {rewards.rewards.map((reward) => (
                <div key={reward.id} className={styles.rewardItem}>
                  <span className={styles.rewardBadge}>
                    {RANK_MEDALS[reward.rank] ?? `${reward.rank}위`}
                  </span>
                  <div className={styles.rewardInfo}>
                    <div className={styles.rewardDescription}>{reward.description}</div>
                    <div className={styles.rewardMeta}>
                      {formatYearMonth(reward.yearMonth)} · {new Date(reward.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <span className={styles.rewardType}>{reward.rewardType}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>아직 받은 리워드가 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
}
