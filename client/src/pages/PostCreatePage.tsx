import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { resizeImage } from '../utils/imageResize';
import { uploadPostImage } from '../api/supabase';
import { AGE_CATEGORIES, FACILITY_OPTIONS } from '../constants/ageCategories';
import styles from './PostCreatePage.module.css';

interface Facilities {
  hasNursingRoom: boolean;
  hasDiaperStation: boolean;
  hasStrollerAccess: boolean;
  hasKidsMenu: boolean;
  hasPlayground: boolean;
}

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTipEvent, setIsTipEvent] = useState(false);
  const [ageCategory, setAgeCategory] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [facilities, setFacilities] = useState<Facilities>({
    hasNursingRoom: false, hasDiaperStation: false, hasStrollerAccess: false,
    hasKidsMenu: false, hasPlayground: false,
  });
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=5&accept-language=ko`
      );
      setLocationResults(await res.json());
    } catch { /* ignore */ }
    setSearching(false);
  };

  const selectLocation = (item: any) => {
    setLocationName(item.display_name?.split(',').slice(0, 3).join(', ') || item.display_name);
    setLatitude(parseFloat(item.lat));
    setLongitude(parseFloat(item.lon));
    setLocationResults([]);
    setLocationQuery('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !content.trim()) { setError('제목과 본문을 모두 입력해주세요'); return; }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const resized = await resizeImage(imageFile);
        imageUrl = await uploadPostImage(resized, imageFile.name.replace(/\.[^.]+$/, '.jpg'));
      }
      const { data } = await apiClient.post('/posts', {
        title: title.trim(), content: content.trim(), is_tip_event: isTipEvent,
        location_name: locationName || null, latitude, longitude,
        image_url: imageUrl, age_category: ageCategory || null,
        facilities: { ...facilities, cleanlinessRating: cleanlinessRating || null },
      });
      navigate(`/posts/${data.id}`);
    } catch { setError('게시글 작성에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>게시글 작성</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="title">제목</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">본문</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="본문을 입력하세요" />
          </div>

          {/* 나이대 카테고리 */}
          <div className={styles.field}>
            <label>나이대 카테고리</label>
            <div className={styles.categoryGrid}>
              {AGE_CATEGORIES.map((cat) => (
                <button key={cat.value} type="button"
                  className={`${styles.categoryBtn} ${ageCategory === cat.value ? styles.categoryActive : ''}`}
                  onClick={() => setAgeCategory(ageCategory === cat.value ? '' : cat.value)}
                >{cat.emoji} {cat.label}</button>
              ))}
            </div>
          </div>

          <label className={styles.checkbox}>
            <input type="checkbox" checked={isTipEvent} onChange={(e) => setIsTipEvent(e.target.checked)} />
            🍯 꿀팁 이벤트 참여
          </label>

          {/* 사진 첨부 */}
          <div className={styles.imageSection}>
            <label>🖼️ 사진 첨부</label>
            {imagePreview ? (
              <div className={styles.imagePreviewWrap}>
                <img src={imagePreview} alt="미리보기" className={styles.imagePreview} />
                <button type="button" className={styles.locationRemoveBtn} onClick={() => { setImageFile(null); setImagePreview(null); }}>✕</button>
              </div>
            ) : (
              <label className={styles.imageUploadBtn}>
                사진 선택
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                }} />
              </label>
            )}
          </div>

          {/* 위치 검색 */}
          <div className={styles.locationSection}>
            <label>📍 위치</label>
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
                  <button key={i} type="button" className={styles.locationResultItem} onClick={() => selectLocation(item)}>
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 육아 시설 체크리스트 */}
          <div className={styles.field}>
            <label>🏢 육아 시설 정보</label>
            <div className={styles.facilityGrid}>
              {FACILITY_OPTIONS.map((opt) => (
                <label key={opt.key} className={styles.facilityCheck}>
                  <input type="checkbox" checked={facilities[opt.key as keyof Facilities]}
                    onChange={(e) => setFacilities({ ...facilities, [opt.key]: e.target.checked })} />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className={styles.cleanlinessRow}>
              <span>🧹 청결도</span>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" className={`${styles.star} ${n <= cleanlinessRating ? styles.starActive : ''}`}
                    onClick={() => setCleanlinessRating(n === cleanlinessRating ? 0 : n)}>★</button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/posts')}>취소</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? '작성 중...' : '작성'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
