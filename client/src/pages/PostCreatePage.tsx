import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { resizeImage } from '../utils/imageResize';
import { uploadPostImage } from '../api/supabase';
import styles from './PostCreatePage.module.css';

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTipEvent, setIsTipEvent] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('제목과 본문을 모두 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const resized = await resizeImage(imageFile);
        imageUrl = await uploadPostImage(resized, imageFile.name.replace(/\.[^.]+$/, '.jpg'));
      }

      const { data } = await apiClient.post('/posts', {
        title: title.trim(),
        content: content.trim(),
        is_tip_event: isTipEvent,
        location_name: locationName || null,
        latitude,
        longitude,
        image_url: imageUrl,
      });
      navigate(`/posts/${data.id}`);
    } catch {
      setError('게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>게시글 작성</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="title">제목</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">본문</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="본문을 입력하세요"
            />
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isTipEvent}
              onChange={(e) => setIsTipEvent(e.target.checked)}
            />
            🍯 꿀팁 이벤트 참여
          </label>

          <div className={styles.imageSection}>
            <label>🖼️ 사진 첨부</label>
            {imagePreview ? (
              <div className={styles.imagePreviewWrap}>
                <img src={imagePreview} alt="미리보기" className={styles.imagePreview} />
                <button
                  type="button"
                  className={styles.locationRemoveBtn}
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className={styles.imageUploadBtn}>
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className={styles.locationSection}>
            <label>📍 위치 공유</label>
            {locationName ? (
              <div className={styles.locationInfo}>
                <span className={styles.locationText}>{locationName}</span>
                <button
                  type="button"
                  className={styles.locationRemoveBtn}
                  onClick={() => { setLocationName(''); setLatitude(null); setLongitude(null); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.locationBtn}
                disabled={locating}
                onClick={async () => {
                  if (!navigator.geolocation) {
                    setError('이 브라우저에서는 위치 공유를 지원하지 않습니다.');
                    return;
                  }
                  setLocating(true);
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      const lat = pos.coords.latitude;
                      const lng = pos.coords.longitude;
                      setLatitude(lat);
                      setLongitude(lng);
                      try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`);
                        const data = await res.json();
                        setLocationName(data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                      } catch {
                        setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                      }
                      setLocating(false);
                    },
                    () => {
                      setError('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
                      setLocating(false);
                    }
                  );
                }}
              >
                {locating ? '위치 가져오는 중...' : '현재 위치 추가'}
              </button>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/posts')}>
              취소
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? '작성 중...' : '작성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
