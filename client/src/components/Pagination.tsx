import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className={styles.pagination} aria-label="페이지 네비게이션">
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="이전 페이지"
      >
        &laquo;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.pageBtn} ${p === currentPage ? styles.active : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="다음 페이지"
      >
        &raquo;
      </button>
    </nav>
  );
}
