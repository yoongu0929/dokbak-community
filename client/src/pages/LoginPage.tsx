import { useState, type FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login, loginWithKakao, isAuthenticated, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인</h1>

        {sessionMessage && (
          <p className={styles.sessionMsg}>{sessionMessage}</p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>

          <div className={styles.divider}>
            <span>또는</span>
          </div>

          <button
            type="button"
            className={styles.kakaoBtn}
            onClick={loginWithKakao}
          >
            💬 카카오로 로그인
          </button>

          <p className={styles.link}>
            계정이 없으신가요? <Link to="/register">회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
