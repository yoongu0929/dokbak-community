-- 003_add_location.sql
-- 게시글에 위치 정보 추가

ALTER TABLE post ADD COLUMN location_name VARCHAR(200) NULL;
ALTER TABLE post ADD COLUMN latitude DOUBLE PRECISION NULL;
ALTER TABLE post ADD COLUMN longitude DOUBLE PRECISION NULL;
