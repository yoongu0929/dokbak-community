import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './NoticeDetailPage.module.css';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const { data } = await apiClient.get(`/notices/${id}`);
        if (!cancelled) setNotice(data);
      } catch { if (!cancelled) setError('공지사항을 불러올 수 없습니다.'); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetch();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className={styles.container}><p className={styles.loading}>로딩 중...</p></div>;
  if (error || !notice) return <div className={styles.container}><p className={styles.error}>{error}</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link to="/notices" className={styles.backLink}>← 공지 목록</Link>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {notice.is_pinned && <span>📌 </span>}
            {notice.title}
          </h1>
        </div>
        <div className={styles.meta}>
          {new Date(notice.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
        <div className={styles.body}>{notice.content}</div>
      </div>
    </div>
  );
}
