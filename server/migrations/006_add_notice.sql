-- 006_add_notice.sql
-- 공지사항 테이블

CREATE TABLE notice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notice_created_at ON notice (created_at DESC);
CREATE INDEX idx_notice_pinned ON notice (is_pinned) WHERE is_pinned = TRUE;

-- 첫 공지글
INSERT INTO notice (title, content, is_pinned) VALUES (
  '🎉 독박육아 커뮤니티가 오픈했습니다!',
  '안녕하세요, 독박육아 커뮤니티에 오신 것을 환영합니다!

독박육아 커뮤니티는 혼자 육아를 담당하는 부모님들을 위한 공간입니다. 바쁜 일상 속에서 육아 정보를 나누고, 서로 응원하며, 함께 성장할 수 있는 따뜻한 커뮤니티를 만들어가고자 합니다.

📌 주요 기능 안내

1. 게시판
자유롭게 육아 경험, 꿀팁, 고민을 나눌 수 있어요. 나이대별 카테고리(신생아~초등)로 필터링할 수 있고, 장소 추천 시 위치 정보와 수유실/기저귀 교환대 등 육아 시설 정보도 함께 공유할 수 있습니다.

2. 🍯 월별 꿀팁 랭킹
게시글 작성 시 "꿀팁 이벤트 참여"를 체크하면 이번 달 꿀팁 랭킹에 참여할 수 있어요. 다른 부모님들의 좋아요를 많이 받으면 랭킹이 올라가고, 매월 상위 3위에게는 푸짐한 리워드가 지급됩니다!

3. 사진 공유
게시글에 사진을 첨부할 수 있어요. 큰 이미지는 자동으로 리사이징되니 부담 없이 올려주세요.

4. 반응형 디자인
PC, 태블릿, 스마트폰 어디서든 편하게 이용할 수 있습니다.

혼자가 아닙니다. 함께 육아해요! 💪
많은 참여와 관심 부탁드립니다.

- 독박육아 커뮤니티 운영팀',
  TRUE
);
