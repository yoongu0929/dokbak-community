-- 010_add_meetup_comment.sql

CREATE TABLE meetup_comment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetup (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetup_comment_meetup ON meetup_comment (meetup_id, created_at ASC);
