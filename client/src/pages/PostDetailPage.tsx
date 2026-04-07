import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../hooks/useAuth';
import LikeButton from '../components/LikeButton';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from './PostDetailPage.module.css';

interface PostDetail {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_nickname: string;
  like_count: number;
  user_liked: boolean;
  is_tip_event: boolean;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liking, setLiking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/posts/${id}`);
      setPost(data);
    } catch {
      setError('게시글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!post || liking) return;
    setLiking(true);
    try {
      const { data } = await apiClient.post(`/posts/${id}/like`);
      setPost((prev) => prev ? { ...prev, like_count: data.likeCount, user_liked: data.liked } : prev);
    } catch {
      // silently fail
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/posts/${id}`);
      navigate('/posts', { replace: true });
    } catch {
      setError('삭제에 실패했습니다.');
    }
    setShowDeleteDialog(false);
  };

  if (loading) return <div className={styles.container}><p className={styles.loading}>로딩 중...</p></div>;
  if (error || !post) return <div className={styles.container}><p className={styles.error}>{error || '게시글을 찾을 수 없습니다.'}</p></div>;

  const isOwner = user?.id === post.author_id;
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link to="/posts" className={styles.backLink}>← 목록으로</Link>

        <div className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          {post.is_tip_event && <span className={styles.tipBadge}>🍯 꿀팁</span>}
        </div>

        <div className={styles.meta}>
          <span>{post.author_nickname}</span>
          <span>{formattedDate}</span>
        </div>

        <div className={styles.body}>{post.content}</div>

        {post.location_name && (
          <div className={styles.locationTag}>
            <a
              href={`https://maps.google.com/?q=${post.latitude},${post.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.locationLink}
            >
              📍 {post.location_name}
            </a>
          </div>
        )}

        <div className={styles.footer}>
          <LikeButton liked={post.user_liked} count={post.like_count} onClick={handleLike} disabled={liking} />
          {isOwner && (
            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => navigate(`/posts/${id}/edit`)}>수정</button>
              <button className={styles.deleteBtn} onClick={() => setShowDeleteDialog(true)}>삭제</button>
            </div>
          )}
        </div>
      </div>

      {showDeleteDialog && (
        <ConfirmDialog
          message="정말로 이 게시글을 삭제하시겠습니까?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
