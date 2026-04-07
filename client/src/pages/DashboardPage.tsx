import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../hooks/useAuth';
import AdSense from '../components/AdSense';
import styles from './DashboardPage.module.css';

interface RecentPost {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  created_at: string;
}

interface RankingPost {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
}

interface MyRanking {
  likeCount: number;
  rank: number;
}

interface DashboardData {
  user: { nickname: string };
  recentPosts: RecentPost[];
  topRanking: RankingPost[];
  myRanking: MyRanking | null;
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        const res = await apiClient.get('/dashboard');
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('대시보드 데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return null;

  const nickname = data.user.nickname || user?.nickname || '';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.welcome}>{nickname}님, 환영합니다!</h1>

        {/* 최근 게시글 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>최근 게시글</h2>
          {data.recentPosts.length === 0 ? (
            <p className={styles.emptyText}>아직 게시글이 없습니다.</p>
          ) : (
            <div className={styles.postList}>
              {data.recentPosts.map((post) => (
                <a
                  key={post.id}
                  className={styles.postItem}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/posts/${post.id}`); }}
                >
                  <span className={styles.postTitle}>{post.title}</span>
                  <span className={styles.postMeta}>
                    <span>{post.author_nickname}</span>
                    <span>❤️ {post.like_count}</span>
                    <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* 광고 배너 */}
        <section className={styles.adSection}>
          <AdSense
            adClient="ca-pub-3128921099207231"
            adSlot="4989483311"
            style={{ minHeight: 90 }}
          />
        </section>

        {/* 이번 달 꿀팁 랭킹 TOP 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🍯 이번 달 꿀팁 랭킹</h2>
          {data.topRanking.length === 0 ? (
            <p className={styles.emptyText}>이번 달 꿀팁 게시글이 없습니다.</p>
          ) : (
            <div className={styles.rankList}>
              {data.topRanking.map((post, idx) => (
                <div key={post.id} className={styles.rankItem}>
                  <span className={styles.rankBadge}>{RANK_MEDALS[idx] ?? `${idx + 1}`}</span>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankTitle}>{post.title}</div>
                    <div className={styles.rankMeta}>
                      {post.author_nickname} · ❤️ {post.like_count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 내 순위 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>내 꿀팁 순위</h2>
          {data.myRanking ? (
            <div className={styles.myRankCard}>
              <div className={styles.myRankStat}>
                <span className={styles.myRankLabel}>현재 순위</span>
                <span className={styles.myRankValue}>{data.myRanking.rank}위</span>
              </div>
              <div className={styles.myRankStat}>
                <span className={styles.myRankLabel}>좋아요 수</span>
                <span className={styles.myRankValue}>{data.myRanking.likeCount}</span>
              </div>
            </div>
          ) : (
            <p className={styles.emptyText}>이번 달 꿀팁 이벤트에 참여한 게시글이 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
}
