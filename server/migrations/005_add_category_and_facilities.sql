-- 005_add_category_and_facilities.sql
-- 나이대 카테고리 및 육아 시설 정보 추가

-- 나이대 카테고리
ALTER TABLE post ADD COLUMN age_category VARCHAR(20) NULL;
-- 값: 'newborn'(신생아 0~6개월), 'infant'(영아 6~12개월), 'toddler'(1~3세), 'preschool'(4~6세), 'school'(7세 이상)

-- 육아 시설 체크리스트 (boolean)
ALTER TABLE post ADD COLUMN has_nursing_room BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE post ADD COLUMN has_diaper_station BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE post ADD COLUMN has_stroller_access BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE post ADD COLUMN has_kids_menu BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE post ADD COLUMN has_playground BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE post ADD COLUMN cleanliness_rating INTEGER NULL; -- 1~5

-- 인덱스
CREATE INDEX idx_post_age_category ON post (age_category) WHERE age_category IS NOT NULL;
