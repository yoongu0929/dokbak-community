import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './PostCreatePage.module.css';

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTipEvent, setIsTipEvent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 모두 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/posts', {
        title: title.trim(),
        content: content.trim(),
        is_tip_event: isTipEvent,
      });
      navigate(`/posts/${data.id}`);
    } catch {
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>게시글 작성</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">본문</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="본문을 입력하세요"
            />
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isTipEvent}
              onChange={(e) => setIsTipEvent(e.target.checked)}
            />
            🍯 꿀팁 이벤트 참여
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/posts')}>
              취소
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? '작성 중...' : '작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
