-- 004_add_image_url.sql
-- 게시글에 이미지 URL 추가

ALTER TABLE post ADD COLUMN image_url VARCHAR(500) NULL;
