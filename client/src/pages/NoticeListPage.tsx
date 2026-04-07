import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './NoticeListPage.module.css';

interface Notice {
  id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
}

export default function NoticeListPage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const { data } = await apiClient.get('/notices');
        if (!cancelled) setNotices(data.notices);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>📢 공지사항</h1>
        {notices.length === 0 ? (
          <p className={styles.empty}>공지사항이 없습니다.</p>
        ) : (
          <div className={styles.list}>
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`${styles.item} ${notice.is_pinned ? styles.pinned : ''}`}
                onClick={() => navigate(`/notices/${notice.id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/notices/${notice.id}`); }}
              >
                <div className={styles.itemTitle}>
                  {notice.is_pinned && <span className={styles.pinBadge}>📌</span>}
                  {notice.title}
                </div>
                <span className={styles.itemDate}>
                  {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
