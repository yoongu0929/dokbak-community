import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../hooks/useAuth';
// import AdSense from '../components/AdSense';
import styles from './DashboardPage.module.css';

interface RecentPost {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  created_at: string;
}

interface RankingPost {
  user_id: string;
  nickname: string;
  total_likes: number;
}

interface MyRanking {
  totalLikes: number;
  rank: number;
}

interface DashboardData {
  user: { nickname: string };
  recentPosts: RecentPost[];
  topRanking: RankingPost[];
  myRanking: MyRanking | null;
  upcomingMeetups: { id: string; title: string; author_nickname: string; meet_date: string; location_name: string | null; rsvp_count: number }[];
  stats: { userCount: number; postCount: number; meetupCount: number };
}

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [slowLoad, setSlowLoad] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setSlowLoad(true); }, 3000);

    async function fetchDashboard() {
      try {
        const res = await apiClient.get('/dashboard');
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('대시보드 데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) { setLoading(false); clearTimeout(slowTimer); }
      }
    }
    fetchDashboard();
    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, []);

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>데이터를 불러오는 중...</p>
          {slowLoad && <p className={styles.slowText}>서버가 깨어나는 중입니다. 최대 30초 정도 걸릴 수 있어요 ☕</p>}
        </div>
      </div>
    </div>
  );
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return null;

  const nickname = data.user.nickname || user?.nickname || '';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.welcome}>{nickname}님, 환영합니다!</h1>

        {/* 커뮤니티 통계 */}
        {data.stats && (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{data.stats.userCount}</span>
              <span className={styles.statLabel}>👥 회원</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{data.stats.postCount}</span>
              <span className={styles.statLabel}>📝 게시글</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{data.stats.meetupCount}</span>
              <span className={styles.statLabel}>⚡ 벙개</span>
            </div>
          </div>
        )}

        {/* 100명 미만 안내 */}
        {data.stats && data.stats.userCount < 100 && (
          <div className={styles.milestone}>
            🎯 회원 {data.stats.userCount}/100명 — 100명 달성 시 랭킹 리워드 이벤트가 시작됩니다!
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(data.stats.userCount, 100)}%` }} />
            </div>
          </div>
        )}

        {/* 공지 배너 */}
        <div className={styles.noticeBanner} onClick={() => navigate('/notices')} role="link" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/notices'); }}>
          📢 공지사항을 확인해주세요
        </div>

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

        {/* 광고 배너 (비활성화)
        <section className={styles.adSection}>
          <AdSense
            adClient="ca-pub-3128921099207231"
            adSlot="4989483311"
            style={{ minHeight: 90 }}
          />
        </section>
        */}

        {/* 이번 달 유저 랭킹 TOP 3 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⭐ 이번 달 유저 랭킹</h2>
          {data.topRanking.length === 0 ? (
            <p className={styles.emptyText}>이번 달 랭킹 데이터가 없습니다.</p>
          ) : (
            <div className={styles.rankList}>
              {data.topRanking.map((user, idx) => (
                <div key={user.user_id} className={styles.rankItem}>
                  <span className={styles.rankBadge}>{RANK_MEDALS[idx] ?? `${idx + 1}`}</span>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankTitle}>{user.nickname}</div>
                    <div className={styles.rankMeta}>
                      총 좋아요 ❤️ {user.total_likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 내 순위 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>내 순위</h2>
          {data.myRanking ? (
            <div className={styles.myRankCard}>
              <div className={styles.myRankStat}>
                <span className={styles.myRankLabel}>현재 순위</span>
                <span className={styles.myRankValue}>{data.myRanking.rank}위</span>
              </div>
              <div className={styles.myRankStat}>
                <span className={styles.myRankLabel}>총 좋아요</span>
                <span className={styles.myRankValue}>{data.myRanking.totalLikes}</span>
              </div>
            </div>
          ) : (
            <p className={styles.emptyText}>이번 달 게시글이 없습니다.</p>
          )}
        </section>

        {/* 다가오는 벙개 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>⚡ 다가오는 벙개</h2>
          {!data.upcomingMeetups || data.upcomingMeetups.length === 0 ? (
            <p className={styles.emptyText}>예정된 벙개가 없습니다.</p>
          ) : (
            <div className={styles.postList}>
              {data.upcomingMeetups.map((m) => (
                <a key={m.id} className={styles.postItem}
                  onClick={() => navigate(`/meetups/${m.id}`)} role="link" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/meetups/${m.id}`); }}>
                  <span className={styles.postTitle}>{m.title}</span>
                  <span className={styles.postMeta}>
                    <span>📅 {new Date(m.meet_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                    {m.location_name && <span>📍 {m.location_name}</span>}
                    <span>✋ {m.rsvp_count}명</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
