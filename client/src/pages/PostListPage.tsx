import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { AGE_CATEGORIES } from '../constants/ageCategories';
import styles from './PostListPage.module.css';

interface Post {
  id: string;
  title: string;
  author_nickname: string;
  like_count: number;
  is_tip_event: boolean;
  age_category: string | null;
  created_at: string;
}

interface PaginationData {
  page: number;
  totalPages: number;
  totalCount: number;
}

export default function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, totalPages: 1, totalCount: 0 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (page: number, keyword: string, category: string) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page };
      if (keyword) params.search = keyword;
      if (category) params.age_category = category;
      const { data } = await apiClient.get('/posts', { params });
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(pagination.page, search, selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (keyword: string) => {
    setSearch(keyword);
    fetchPosts(1, keyword, selectedCategory);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, search, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchPosts(1, search, category);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>게시판</h1>
          <Link to="/posts/new" className={styles.createBtn}>글쓰기</Link>
        </div>

        <div className={styles.searchWrap}>
          <SearchBar onSearch={handleSearch} initialValue={search} />
        </div>

        <div className={styles.categoryTabs}>
          <button
            className={`${styles.categoryTab} ${selectedCategory === '' ? styles.categoryTabActive : ''}`}
            onClick={() => handleCategoryChange('')}
          >전체</button>
          {AGE_CATEGORIES.map((cat) => (
            <button key={cat.value}
              className={`${styles.categoryTab} ${selectedCategory === cat.value ? styles.categoryTabActive : ''}`}
              onClick={() => handleCategoryChange(cat.value)}
            >{cat.emoji} {cat.label}</button>
          ))}
        </div>

        {loading ? (
          <p className={styles.loading}>로딩 중...</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>게시글이 없습니다.</p>
        ) : (
          <>
            <div className={styles.list}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  authorNickname={post.author_nickname}
                  likeCount={post.like_count}
                  isTipEvent={post.is_tip_event}
                  createdAt={post.created_at}
                />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
