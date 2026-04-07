import { useNavigate } from 'react-router-dom';
import styles from './PostCard.module.css';

interface PostCardProps {
  id: string;
  title: string;
  authorNickname: string;
  likeCount: number;
  isTipEvent: boolean;
  createdAt: string;
}

export default function PostCard({ id, title, authorNickname, likeCount, isTipEvent, createdAt }: PostCardProps) {
  const navigate = useNavigate();

  const formattedDate = new Date(createdAt).toLocaleDateString('ko-KR');

  return (
    <article className={styles.card} onClick={() => navigate(`/posts/${id}`)} role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/posts/${id}`); }}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {isTipEvent && <span className={styles.tipBadge}>🍯 꿀팁</span>}
      </div>
      <div className={styles.meta}>
        <span>{authorNickname}</span>
        <span>{formattedDate}</span>
        <span>❤️ {likeCount}</span>
      </div>
    </article>
  );
}
