import styles from './LikeButton.module.css';

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

export default function LikeButton({ liked, count, onClick, disabled }: LikeButtonProps) {
  return (
    <button
      className={`${styles.likeBtn} ${liked ? styles.liked : ''}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      aria-pressed={liked}
    >
      <span className={styles.heart}>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
}
