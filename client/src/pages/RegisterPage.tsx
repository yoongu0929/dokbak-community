import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || !nickname.trim()) {
      setError('모든 항목을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password, nickname);
      navigate('/login', { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('이미 등록된 이메일입니다');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원가입</h1>

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
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              autoComplete="nickname"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? '가입 중...' : '가입하기'}
          </button>

          <p className={styles.link}>
            이미 계정이 있으신가요? <Link to="/login">로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
