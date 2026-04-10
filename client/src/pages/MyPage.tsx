import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/client';
import styles from './MyPage.module.css';

interface MyRankingData {
  yearMonth: string;
  myRank: { totalLikes: number; postCount: number; rank: number } | null;
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
  const [kakaoId, setKakaoId] = useState('');
  const [kakaoSaved, setKakaoSaved] = useState(false);
  const [kakaoSaving, setKakaoSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [rankingRes, rewardRes, profileRes] = await Promise.all([
          apiClient.get('/ranking/my'),
          apiClient.get('/rewards/my'),
          apiClient.get('/profile/me'),
        ]);
        if (!cancelled) {
          setMyRanking(rankingRes.data);
          setRewards(rewardRes.data);
          setKakaoId(profileRes.data.kakaoId || '');
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
          <h2 className={styles.sectionTitle}>⭐ 이번 달 내 순위</h2>
          {myRanking?.myRank ? (
            <>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 0.5rem' }}>
                {formatYearMonth(myRanking.yearMonth)}
              </p>
              <div className={styles.myRankCard}>
                <div className={styles.myRankStat}>
                  <span className={styles.myRankLabel}>순위</span>
                  <span className={styles.myRankValue}>{RANK_MEDALS[myRanking.myRank.rank] ?? `${myRanking.myRank.rank}위`}</span>
                </div>
                <div className={styles.myRankStat}>
                  <span className={styles.myRankLabel}>총 좋아요</span>
                  <span className={styles.myRankValue}>❤️ {myRanking.myRank.totalLikes}</span>
                </div>
                <div className={styles.myRankStat}>
                  <span className={styles.myRankLabel}>게시글 수</span>
                  <span className={styles.myRankValue}>{myRanking.myRank.postCount}개</span>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>이번 달 게시글이 없습니다.</p>
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

        {/* 카카오 ID (리워드 수령용) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💬 카카오톡 ID</h2>
          <p className={styles.kakaoDesc}>랭킹 리워드(기프티콘)를 받기 위해 카카오톡 ID를 등록해주세요.</p>
          <div className={styles.kakaoInputRow}>
            <input
              type="text"
              className={styles.kakaoInput}
              value={kakaoId}
              onChange={(e) => { setKakaoId(e.target.value); setKakaoSaved(false); }}
              placeholder="카카오톡 ID를 입력하세요"
            />
            <button
              className={styles.kakaoSaveBtn}
              disabled={kakaoSaving}
              onClick={async () => {
                setKakaoSaving(true);
                try {
                  await apiClient.put('/profile/me/kakao-id', { kakaoId: kakaoId.trim() });
                  setKakaoSaved(true);
                } catch { /* ignore */ }
                finally { setKakaoSaving(false); }
              }}
            >
              {kakaoSaving ? '저장 중...' : '저장'}
            </button>
          </div>
          {kakaoSaved && <p className={styles.kakaoSavedMsg}>✅ 저장되었습니다</p>}
        </section>
      </div>
    </div>
  );
}
