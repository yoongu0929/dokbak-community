import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './RankingArchivePage.module.css';

interface ArchiveRankingEntry {
  id: string;
  postId: string;
  title: string;
  authorNickname: string;
  likeCount: number;
  rank: number;
  finalizedAt: string;
}

interface ArchiveData {
  yearMonth: string;
  rankings: ArchiveRankingEntry[];
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${year}년 ${parseInt(month, 10)}월`;
}

export default function RankingArchivePage() {
  const { yearMonth } = useParams<{ yearMonth: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ArchiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(yearMonth || '');

  useEffect(() => {
    if (!yearMonth) return;
    let cancelled = false;
    setLoading(true);
    setError('');

    async function fetchArchive() {
      try {
        const res = await apiClient.get(`/ranking/archive/${yearMonth}`);
        if (!cancelled) setData(res.data);
      } catch {
        if (!cancelled) setError('아카이브 데이터를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchArchive();
    return () => { cancelled = true; };
  }, [yearMonth]);

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedMonth(value);
    if (value) {
      navigate(`/ranking/archive/${value}`, { replace: true });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>📂 랭킹 아카이브</h1>
          <a
            className={styles.backLink}
            onClick={() => navigate('/ranking')}
            role="link"
            tabIndex={0}
          >
            ← 이번 달 랭킹
          </a>
        </div>

        <div className={styles.monthSelector}>
          <label htmlFor="month-select">조회 월:</label>
          <input
            id="month-select"
            type="month"
            className={styles.monthInput}
            value={selectedMonth}
            onChange={handleMonthChange}
          />
        </div>

        {loading && <div className={styles.loading}>로딩 중...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && data && (
          <>
            <p className={styles.yearMonth}>
              {formatYearMonth(data.yearMonth)}
              <span className={styles.finalizedBadge}> 확정됨</span>
            </p>

            {data.rankings.length === 0 ? (
              <p className={styles.emptyText}>해당 월의 랭킹 데이터가 없습니다.</p>
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
                          {entry.authorNickname} · ❤️ {entry.likeCount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
