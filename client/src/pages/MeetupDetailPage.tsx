import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { AGE_CATEGORY_MAP } from '../constants/ageCategories';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from './MeetupDetailPage.module.css';

interface Rsvp { id: string; user_id: string; nickname: string; status: string; }
interface MeetupDetail {
  id: string; title: string; description: string; author_id: string; author_nickname: string;
  location_name: string | null; latitude: number | null; longitude: number | null;
  meet_date: string; max_participants: number | null; age_category: string | null;
  rsvp_count: number; user_rsvp: string | null; status: string; created_at: string;
  rsvps: Rsvp[];
}

export default function MeetupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetup, setMeetup] = useState<MeetupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchMeetup = useCallback(async () => {
    try {
      const { data } = await apiClient.get(`/meetups/${id}`);
      setMeetup(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchMeetup(); }, [fetchMeetup]);

  const handleRsvp = async () => {
    if (toggling || !meetup) return;
    setToggling(true);
    try {
      const { data } = await apiClient.post(`/meetups/${id}/rsvp`);
      setMeetup((prev) => prev ? {
        ...prev,
        rsvp_count: data.rsvpCount,
        user_rsvp: data.attending ? 'attending' : null,
      } : prev);
      fetchMeetup();
    } catch { /* ignore */ }
    finally { setToggling(false); }
  };

  const handleDelete = async () => {
    try { await apiClient.delete(`/meetups/${id}`); navigate('/meetups', { replace: true }); }
    catch { /* ignore */ }
    setShowDelete(false);
  };

  if (loading) return <div className={styles.container}><p className={styles.loading}>로딩 중...</p></div>;
  if (!meetup) return <div className={styles.container}><p>벙개를 찾을 수 없습니다.</p></div>;

  const isOwner = user?.id === meetup.author_id;
  const isAttending = meetup.user_rsvp === 'attending';
  const isFull = meetup.max_participants ? meetup.rsvp_count >= meetup.max_participants : false;
  const dateStr = new Date(meetup.meet_date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link to="/meetups" className={styles.backLink}>← 벙개 목록</Link>
        <div className={styles.header}>
          <h1 className={styles.title}>{meetup.title}</h1>
          {meetup.age_category && <span className={styles.ageBadge}>{AGE_CATEGORY_MAP[meetup.age_category]}</span>}
        </div>
        <div className={styles.meta}>
          <span>👤 {meetup.author_nickname}</span>
          <span>📅 {dateStr}</span>
        </div>
        {meetup.location_name && (
          <div className={styles.location}>
            <a href={`https://maps.google.com/?q=${meetup.latitude},${meetup.longitude}`}
              target="_blank" rel="noopener noreferrer">📍 {meetup.location_name}</a>
          </div>
        )}
        <div className={styles.body}>{meetup.description}</div>

        <div className={styles.rsvpSection}>
          <div className={styles.rsvpHeader}>
            <span className={styles.rsvpTitle}>✋ 참석자 ({meetup.rsvp_count}{meetup.max_participants ? `/${meetup.max_participants}` : ''}명)</span>
            <button className={`${styles.rsvpBtn} ${isAttending ? styles.rsvpActive : ''}`}
              onClick={handleRsvp} disabled={toggling || (isFull && !isAttending)}>
              {isAttending ? '참석 취소' : isFull ? '마감' : '참석하기'}
            </button>
          </div>
          {meetup.rsvps && meetup.rsvps.length > 0 && (
            <div className={styles.rsvpList}>
              {meetup.rsvps.map((r) => (
                <span key={r.id} className={styles.rsvpChip}>{r.nickname}</span>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
          <button className={styles.deleteBtn} onClick={() => setShowDelete(true)}>벙개 삭제</button>
        )}
      </div>
      {showDelete && <ConfirmDialog message="정말로 이 벙개를 삭제하시겠습니까?" onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
    </div>
  );
}
