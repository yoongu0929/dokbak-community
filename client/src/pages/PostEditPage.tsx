import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import styles from './PostCreatePage.module.css';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTipEvent, setIsTipEvent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await apiClient.get(`/posts/${id}`);
        setTitle(data.title);
        setContent(data.content);
        setIsTipEvent(data.is_tip_event);
      } catch {
        setError('게시글을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 모두 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.put(`/posts/${id}`, {
        title: title.trim(),
        content: content.trim(),
        is_tip_event: isTipEvent,
      });
      navigate(`/posts/${id}`);
    } catch {
      setError('게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.container}><p>로딩 중...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>게시글 수정</h1>
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
            <button type="button" className={styles.cancelBtn} onClick={() => navigate(`/posts/${id}`)}>
              취소
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? '수정 중...' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
