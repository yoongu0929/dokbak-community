import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Header.module.css';

export default function Header() {
  const { isAuthenticated, logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    closeMenu();
    await logout();
    navigate('/login');
  }, [logout, navigate, closeMenu]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link to="/dashboard" className={styles.logo}>
          독박육아 커뮤니티
        </Link>

        {/* Desktop / Tablet nav */}
        <nav className={styles.desktopNav}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.navLink}>대시보드</Link>
              <Link to="/notices" className={styles.navLink}>공지</Link>
              <Link to="/posts" className={styles.navLink}>게시판</Link>
              <Link to="/meetups" className={styles.navLink}>벙개</Link>
              <Link to="/ranking" className={styles.navLink}>랭킹</Link>
              <Link to="/mypage" className={styles.navLink}>마이페이지</Link>
              <Link to="/suggestions" className={styles.navLink}>개선제안</Link>
              {authUser?.role === 'admin' && (
                <>
                  <Link to="/admin/notices" className={styles.navLink}>관리:공지</Link>
                  <Link to="/admin/suggestions" className={styles.navLink}>관리:제안</Link>
                </>
              )}
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>로그인</Link>
              <Link to="/register" className={styles.navLink}>회원가입</Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
        >
          <span className={styles.hamburgerIcon} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <nav
        id="mobile-nav-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-label="모바일 내비게이션"
      >
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className={styles.mobileNavLink} onClick={closeMenu}>대시보드</Link>
            <Link to="/notices" className={styles.mobileNavLink} onClick={closeMenu}>공지</Link>
            <Link to="/posts" className={styles.mobileNavLink} onClick={closeMenu}>게시판</Link>
            <Link to="/meetups" className={styles.mobileNavLink} onClick={closeMenu}>벙개</Link>
            <Link to="/ranking" className={styles.mobileNavLink} onClick={closeMenu}>랭킹</Link>
            <Link to="/mypage" className={styles.mobileNavLink} onClick={closeMenu}>마이페이지</Link>
            <Link to="/suggestions" className={styles.mobileNavLink} onClick={closeMenu}>개선제안</Link>
            {authUser?.role === 'admin' && (
              <>
                <Link to="/admin/notices" className={styles.mobileNavLink} onClick={closeMenu}>관리:공지</Link>
                <Link to="/admin/suggestions" className={styles.mobileNavLink} onClick={closeMenu}>관리:제안</Link>
              </>
            )}
            <button type="button" className={styles.mobileLogoutBtn} onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.mobileNavLink} onClick={closeMenu}>로그인</Link>
            <Link to="/register" className={styles.mobileNavLink} onClick={closeMenu}>회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
