import { useState, type FormEvent } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  initialValue?: string;
}

export default function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="검색어를 입력하세요"
        aria-label="검색어"
      />
      <button className={styles.searchBtn} type="submit">
        검색
      </button>
    </form>
  );
}
