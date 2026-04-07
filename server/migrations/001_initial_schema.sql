-- 001_initial_schema.sql
-- 독박육아 커뮤니티 초기 데이터베이스 스키마

-- UUID 생성을 위한 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User 테이블
-- ============================================
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "user" (email);

-- ============================================
-- Post 테이블
-- ============================================
CREATE TABLE post (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_tip_event BOOLEAN NOT NULL DEFAULT FALSE,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_post_author_id ON post (author_id);
CREATE INDEX idx_post_created_at ON post (created_at DESC);
CREATE INDEX idx_post_is_tip_event ON post (is_tip_event) WHERE is_tip_event = TRUE;

-- ============================================
-- Like 테이블
-- ============================================
CREATE TABLE "like" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES post (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_like_user_post UNIQUE (user_id, post_id)
);

CREATE INDEX idx_like_user_id ON "like" (user_id);
CREATE INDEX idx_like_post_id ON "like" (post_id);


-- ============================================
-- MonthlyRanking 테이블
-- ============================================
CREATE TABLE monthly_ranking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES post (id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NULL,
    is_finalized BOOLEAN NOT NULL DEFAULT FALSE,
    finalized_at TIMESTAMP NULL
);

CREATE INDEX idx_monthly_ranking_year_month ON monthly_ranking (year_month);
CREATE INDEX idx_monthly_ranking_post_id ON monthly_ranking (post_id);
CREATE INDEX idx_monthly_ranking_finalized ON monthly_ranking (year_month, is_finalized);

-- ============================================
-- Reward 테이블
-- ============================================
CREATE TABLE reward (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    ranking_id UUID NOT NULL REFERENCES monthly_ranking (id) ON DELETE CASCADE,
    year_month VARCHAR(7) NOT NULL,
    rank INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_user_id ON reward (user_id);
CREATE INDEX idx_reward_year_month ON reward (year_month);
