import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import styles from './AdminSuggestionPage.module.css';

interface Suggestion {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

const STATUSES = [
  { value: 'pending', label: '검토 중' },
  { value: 'accepted', label: '채택' },
  { value: 'completed', label: '반영 완료' },
  { value: 'declined', label: '보류' },
];

export default function AdminSuggestionPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const { data } = await apiClient.get('/suggestions/all');
      setSuggestions(data.suggestions);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiClient.put(`/suggestions/${id}/status`, { status });
      setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    } catch { /* ignore */ }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>개선사항 관리 ({suggestions.length}건)</h1>
        {suggestions.length === 0 ? (
          <p className={styles.muted}>접수된 제안이 없습니다.</p>
        ) : (
          suggestions.map((s) => (
            <div key={s.id} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.itemTitle}>{s.title}</span>
                <span className={styles.itemAuthor}>{s.nickname}</span>
              </div>
              <p className={styles.itemContent}>{s.content}</p>
              <div className={styles.itemFooter}>
                <span className={styles.itemDate}>
                  {new Date(s.created_at + 'Z').toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </span>
                <select value={s.status} onChange={(e) => handleStatusChange(s.id, e.target.value)} className={styles.statusSelect}>
                  {STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>{st.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
