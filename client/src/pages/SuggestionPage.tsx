import { useState, useEffect, type FormEvent } from 'react';
import apiClient from '../api/client';
import styles from './SuggestionPage.module.css';

interface Suggestion {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '검토 중',
  accepted: '채택됨',
  completed: '반영 완료',
  declined: '보류',
};

export default function SuggestionPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/suggestions/my')
      .then(({ data }) => setSuggestions(data.suggestions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 입력해주세요'); return; }
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/suggestions', { title: title.trim(), content: content.trim() });
      setSuggestions((prev) => [data, ...prev]);
      setTitle(''); setContent(''); setSuccess(true);
    } catch { setError('제출에 실패했습니다'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>개선사항 제안</h1>

        <div className={styles.infoBanner}>
          <p className={styles.infoTitle}>여러분의 아이디어를 들려주세요!</p>
          <p className={styles.infoText}>
            독박육아 커뮤니티를 더 좋게 만들 수 있는 아이디어나 개선사항을 자유롭게 제안해주세요.
            정말 좋은 아이디어나 서비스 개선에 큰 도움이 되는 제안에 대해서는 감사의 마음을 담아 소정의 상품(기프티콘)으로 보답해드립니다!
          </p>
        </div>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>새 제안 작성</h2>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>제안이 접수되었습니다. 감사합니다!</p>}
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>제목</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제안 제목을 입력하세요" />
            </div>
            <div className={styles.field}>
              <label>내용</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="구체적인 개선 아이디어를 적어주세요" rows={5} />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? '제출 중...' : '제안하기'}
            </button>
          </form>
        </div>

        <div className={styles.listSection}>
          <h2 className={styles.listTitle}>내 제안 내역</h2>
          {loading ? <p className={styles.muted}>로딩 중...</p> :
            suggestions.length === 0 ? <p className={styles.muted}>아직 제안한 내역이 없습니다.</p> :
            suggestions.map((s) => (
              <div key={s.id} className={styles.suggestionItem}>
                <div className={styles.suggestionHeader}>
                  <span className={styles.suggestionTitle}>{s.title}</span>
                  <span className={`${styles.statusBadge} ${styles[`status_${s.status}`] || ''}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                </div>
                <p className={styles.suggestionContent}>{s.content}</p>
                <span className={styles.suggestionDate}>
                  {new Date(s.created_at + 'Z').toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
