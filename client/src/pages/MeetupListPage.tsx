import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { AGE_CATEGORY_MAP } from '../constants/ageCategories';
import styles from './MeetupListPage.module.css';

interface Meetup {
  id: string;
  title: string;
  author_nickname: string;
  location_name: string | null;
  meet_date: string;
  max_participants: number | null;
  age_category: string | null;
  rsvp_count: number;
  status: string;
}

export default function MeetupListPage() {
  const navigate = useNavigate();
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const { data } = await apiClient.get('/meetups');
        if (!cancelled) setMeetups(data.meetups);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>⚡ 벙개/모임</h1>
          <Link to="/meetups/new" className={styles.createBtn}>벙개 만들기</Link>
        </div>

        {meetups.length === 0 ? (
          <p className={styles.empty}>아직 벙개가 없습니다. 첫 벙개를 만들어보세요!</p>
        ) : (
          <div className={styles.list}>
            {meetups.map((m) => {
              const dateStr = new Date(m.meet_date).toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit',
              });
              return (
                <div key={m.id} className={styles.card} onClick={() => navigate(`/meetups/${m.id}`)}
                  role="link" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/meetups/${m.id}`); }}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{m.title}</span>
                    {m.age_category && <span className={styles.ageBadge}>{AGE_CATEGORY_MAP[m.age_category]}</span>}
                  </div>
                  <div className={styles.cardMeta}>
                    <span>📅 {dateStr}</span>
                    {m.location_name && <span>📍 {m.location_name}</span>}
                  </div>
                  <div className={styles.cardFooter}>
                    <span>👤 {m.author_nickname}</span>
                    <span className={styles.rsvpCount}>
                      ✋ {m.rsvp_count}명 참석{m.max_participants ? ` / ${m.max_participants}명` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
