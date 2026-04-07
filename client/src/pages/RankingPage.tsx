import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './RankingPage.module.css';

interface RankingEntry {
  id: string;
  title: string;
  authorNickname: string;
  likeCount: number;
  createdAt: string;
  rank: number;
}

interface RankingData {
  yearMonth: string;
  rankings: RankingEntry[];
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${year}년 ${parseInt(month, 10)}월`;
}

export default function RankingPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchRanking() {
      try {
        const res = await apiClient.get('/ranking/current');
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('랭킹 데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRanking();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>🍯 이번 달 꿀팁 랭킹</h1>
          <a
            className={styles.archiveLink}
            onClick={() => {
              const now = new Date();
              const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const ym = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
              navigate(`/ranking/archive/${ym}`);
            }}
            role="link"
            tabIndex={0}
          >
            📂 지난 랭킹 보기
          </a>
        </div>

        <p className={styles.yearMonth}>
          {formatYearMonth(data.yearMonth)}
          <span className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            실시간
          </span>
        </p>

        {data.rankings.length === 0 ? (
          <p className={styles.emptyText}>이번 달 꿀팁 게시글이 없습니다.</p>
        ) : (
          <div className={styles.rankList}>
            {data.rankings.map((entry) => {
              const medal = RANK_MEDALS[entry.rank];
              return (
                <div
                  key={entry.id}
                  className={`${styles.rankItem}${entry.rank <= 3 ? ` ${styles.topRank}` : ''}`}
                >
                  {medal ? (
                    <span className={styles.rankBadge}>{medal}</span>
                  ) : (
                    <span className={styles.rankNumber}>{entry.rank}</span>
                  )}
                  <div className={styles.rankInfo}>
                    <div className={styles.rankTitle}>{entry.title}</div>
                    <div className={styles.rankMeta}>
                      {entry.authorNickname} · {new Date(entry.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <span className={styles.likeCount}>❤️ {entry.likeCount}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
