import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data } = await apiClient.get(`/posts/${id}`);
        setTitle(data.title);
        setContent(data.content);
        setIsTipEvent(data.is_tip_event);
        setAgeCategory(data.age_category || '');
        setLocationName(data.location_name || '');
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setExistingImages(data.image_urls || []);
        setFacilities({
          hasNursingRoom: data.has_nursing_room,
          hasDiaperStation: data.has_diaper_station,
          hasStrollerAccess: data.has_stroller_access,
          hasKidsMenu: data.has_kids_menu,
          hasPlayground: data.has_playground,
        });
        setCleanlinessRating(data.cleanliness_rating || 0);
      } catch { setError('게시글을 불러올 수 없습니다.'); }
      finally { setLoading(false); }
    }
    fetchPost();
  }, [id]);

  const totalImages = existingImages.length + newImageFiles.length;

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&limit=5&accept-language=ko`);
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
    if (totalImages > 5) { setError('사진은 최대 5장까지 첨부할 수 있습니다'); return; }

    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const resized = await resizeImage(file);
        uploadedUrls.push(await uploadPostImage(resized, file.name.replace(/\.[^.]+$/, '.jpg')));
      }
      await apiClient.put(`/posts/${id}`, {
        title: title.trim(), content: content.trim(), is_tip_event: isTipEvent,
        location_name: locationName || null, latitude, longitude,
        image_urls: [...existingImages, ...uploadedUrls],
        age_category: ageCategory || null,
        facilities: { ...facilities, cleanlinessRating: cleanlinessRating || null },
      });
      navigate(`/posts/${id}`);
    } catch { setError('게시글 수정에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className={styles.container}><p>로딩 중...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>게시글 수정</h1>
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

          <div className={styles.imageSection}>
            <label>🖼️ 사진 ({totalImages}/5)</label>
            <div className={styles.imageGrid}>
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className={styles.imagePreviewWrap}>
                  <img src={url} alt={`기존 ${idx + 1}`} className={styles.imagePreview} />
                  <button type="button" className={styles.imageRemoveBtn} onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}>✕</button>
                </div>
              ))}
              {newImagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className={styles.imagePreviewWrap}>
                  <img src={preview} alt={`새 ${idx + 1}`} className={styles.imagePreview} />
                  <button type="button" className={styles.imageRemoveBtn} onClick={() => {
                    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
                    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                  }}>✕</button>
                </div>
              ))}
              {totalImages < 5 && (
                <label className={styles.imageUploadBtn}>
                  + 사진 추가
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && totalImages < 5) {
                      setNewImageFiles((prev) => [...prev, file]);
                      setNewImagePreviews((prev) => [...prev, URL.createObjectURL(file)]);
                    }
                    e.target.value = '';
                  }} />
                </label>
              )}
            </div>
          </div>

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
                  <button key={i} type="button" className={styles.locationResultItem} onClick={() => selectLocation(item)}>{item.display_name}</button>
                ))}
              </div>
            )}
          </div>

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
            <button type="button" className={styles.cancelBtn} onClick={() => navigate(`/posts/${id}`)}>취소</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? '수정 중...' : '수정'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
