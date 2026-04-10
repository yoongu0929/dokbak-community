-- 012_add_user_role.sql
ALTER TABLE "user" ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
-- 값: 'admin', 'user'

-- test@example.com을 관리자로 설정
UPDATE "user" SET role = 'admin' WHERE email = 'test@example.com';
