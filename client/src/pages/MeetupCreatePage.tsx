import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { AGE_CATEGORIES } from '../constants/ageCategories';
import styles from './PostCreatePage.module.css';

export default function MeetupCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=5&accept-language=ko`);
      setLocationResults(await res.json());
    } catch { /* ignore */ }
    setSearching(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !description.trim() || !meetDate) { setError('제목, 설명, 날짜를 모두 입력해주세요'); return; }
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/meetups', {
        title: title.trim(), description: description.trim(), meet_date: meetDate,
        location_name: locationName || null, latitude, longitude,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        age_category: ageCategory || null,
      });
      navigate(`/meetups/${data.id}`);
    } catch { setError('벙개 만들기에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>⚡ 벙개 만들기</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.field}>
            <label htmlFor="title">제목</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="벙개 제목" />
          </div>
          <div className={styles.field}>
            <label htmlFor="desc">설명</label>
            <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="모임 설명을 적어주세요" />
          </div>
          <div className={styles.field}>
            <label htmlFor="date">날짜/시간</label>
            <input id="date" type="datetime-local" value={meetDate} onChange={(e) => setMeetDate(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label htmlFor="max">최대 인원 (선택)</label>
            <input id="max" type="number" min="2" value={maxParticipants} onChange={(e) => setMaxParticipants(e.target.value)} placeholder="제한 없음" />
          </div>
          <div className={styles.field}>
            <label>나이대</label>
            <div className={styles.categoryGrid}>
              {AGE_CATEGORIES.map((cat) => (
                <button key={cat.value} type="button"
                  className={`${styles.categoryBtn} ${ageCategory === cat.value ? styles.categoryActive : ''}`}
                  onClick={() => setAgeCategory(ageCategory === cat.value ? '' : cat.value)}
                >{cat.emoji} {cat.label}</button>
              ))}
            </div>
          </div>
          <div className={styles.locationSection}>
            <label>📍 장소</label>
            {locationName ? (
              <div className={styles.locationInfo}>
                <span className={styles.locationText}>{locationName}</span>
                <button type="button" className={styles.locationRemoveBtn} onClick={() => { setLocationName(''); setLatitude(null); setLongitude(null); }}>✕</button>
              </div>
            ) : (
              <div className={styles.locationSearch}>
                <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="장소를 검색하세요" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchLocation(); } }} />
                <button type="button" className={styles.locationBtn} onClick={searchLocation} disabled={searching}>
                  {searching ? '검색 중...' : '검색'}
                </button>
              </div>
            )}
            {locationResults.length > 0 && (
              <div className={styles.locationResults}>
                {locationResults.map((item: any, i: number) => (
                  <button key={i} type="button" className={styles.locationResultItem} onClick={() => {
                    setLocationName(item.display_name?.split(',').slice(0, 3).join(', ') || item.display_name);
                    setLatitude(parseFloat(item.lat)); setLongitude(parseFloat(item.lon));
                    setLocationResults([]); setLocationQuery('');
                  }}>{item.display_name}</button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/meetups')}>취소</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? '만드는 중...' : '벙개 만들기'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
