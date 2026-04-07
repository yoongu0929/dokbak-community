import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { deletePostImages } from '../api/supabase';
import { useAuth } from '../hooks/useAuth';
import LikeButton from '../components/LikeButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { AGE_CATEGORY_MAP, FACILITY_OPTIONS } from '../constants/ageCategories';
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
  image_urls: string[];
  age_category: string | null;
  has_nursing_room: boolean;
  has_diaper_station: boolean;
  has_stroller_access: boolean;
  has_kids_menu: boolean;
  has_playground: boolean;
  cleanliness_rating: number | null;
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
      const { data } = await apiClient.delete(`/posts/${id}`);
      if (data.imageUrls && data.imageUrls.length > 0) {
        await deletePostImages(data.imageUrls).catch(() => {});
      }
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
          {post.age_category && <span className={styles.ageBadge}>{AGE_CATEGORY_MAP[post.age_category]}</span>}
        </div>

        <div className={styles.meta}>
          <span>{post.author_nickname}</span>
          <span>{formattedDate}</span>
        </div>

        <div className={styles.body}>{post.content}</div>

        {post.image_urls && post.image_urls.length > 0 && (
          <div className={styles.postImages}>
            {post.image_urls.map((url: string, idx: number) => (
              <img key={idx} src={url} alt={`게시글 이미지 ${idx + 1}`} className={styles.postImage} />
            ))}
          </div>
        )}

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

        {(post.has_nursing_room || post.has_diaper_station || post.has_stroller_access || post.has_kids_menu || post.has_playground || post.cleanliness_rating) && (
          <div className={styles.facilityInfo}>
            <div className={styles.facilityTags}>
              {post.has_nursing_room && <span className={styles.facilityTag}>🤱 수유실</span>}
              {post.has_diaper_station && <span className={styles.facilityTag}>🚼 기저귀 교환대</span>}
              {post.has_stroller_access && <span className={styles.facilityTag}>🛒 유모차 접근</span>}
              {post.has_kids_menu && <span className={styles.facilityTag}>🍽️ 키즈 메뉴</span>}
              {post.has_playground && <span className={styles.facilityTag}>🛝 놀이시설</span>}
            </div>
            {post.cleanliness_rating && (
              <span className={styles.cleanlinessDisplay}>🧹 청결도 {'★'.repeat(post.cleanliness_rating)}{'☆'.repeat(5 - post.cleanliness_rating)}</span>
            )}
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
