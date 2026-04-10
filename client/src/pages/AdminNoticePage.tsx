import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from './AdminNoticePage.module.css';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export default function AdminNoticePage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchNotices = async () => {
    try {
      const { data } = await apiClient.get('/notices');
      setNotices(data.notices);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const resetForm = () => { setEditId(null); setTitle(''); setContent(''); setIsPinned(false); setError(''); };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setError('제목과 내용을 입력해주세요'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await apiClient.put(`/notices/${editId}`, { title, content, is_pinned: isPinned });
      } else {
        await apiClient.post('/notices', { title, content, is_pinned: isPinned });
      }
      resetForm();
      fetchNotices();
    } catch { setError('저장에 실패했습니다'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (notice: Notice) => {
    setEditId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setIsPinned(notice.is_pinned);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await apiClient.delete(`/notices/${deleteId}`); fetchNotices(); }
    catch { /* ignore */ }
    setDeleteId(null);
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>🔧 공지사항 관리</h1>

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>{editId ? '공지 수정' : '새 공지 작성'}</h2>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.field}>
            <label>제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" />
          </div>
          <div className={styles.field}>
            <label>내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="공지 내용" rows={10} />
          </div>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            📌 상단 고정
          </label>
          <div className={styles.formActions}>
            {editId && <button className={styles.cancelBtn} onClick={resetForm}>취소</button>}
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
              {submitting ? '저장 중...' : editId ? '수정' : '작성'}
            </button>
          </div>
        </div>

        <div className={styles.listSection}>
          <h2 className={styles.listTitle}>공지 목록</h2>
          {notices.map((n) => (
            <div key={n.id} className={`${styles.noticeItem} ${n.is_pinned ? styles.pinned : ''}`}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeTitle}>{n.is_pinned && '📌 '}{n.title}</span>
                <span className={styles.noticeDate}>{new Date(n.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className={styles.noticeActions}>
                <button className={styles.editBtn} onClick={() => handleEdit(n)}>수정</button>
                <button className={styles.deleteBtn} onClick={() => setDeleteId(n.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {deleteId && <ConfirmDialog message="이 공지를 삭제하시겠습니까?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
