-- 008_add_oauth_provider.sql
-- OAuth 로그인 사용자 지원

ALTER TABLE "user" ADD COLUMN oauth_provider VARCHAR(20) NULL;
ALTER TABLE "user" ADD COLUMN oauth_id VARCHAR(255) NULL;
ALTER TABLE "user" ALTER COLUMN password_hash DROP NOT NULL;
