-- 007_image_urls_array.sql
-- image_url(단일) → image_urls(JSON 배열)로 변경

ALTER TABLE post ADD COLUMN image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 기존 image_url 데이터 마이그레이션
UPDATE post SET image_urls = jsonb_build_array(image_url) WHERE image_url IS NOT NULL;

ALTER TABLE post DROP COLUMN image_url;
