-- 009_add_meetup.sql
-- 벙개/모임 테이블

CREATE TABLE meetup (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location_name VARCHAR(200) NULL,
    latitude DOUBLE PRECISION NULL,
    longitude DOUBLE PRECISION NULL,
    meet_date TIMESTAMP NOT NULL,
    max_participants INTEGER NULL,
    age_category VARCHAR(20) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE meetup_rsvp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meetup_id UUID NOT NULL REFERENCES meetup (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'attending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_meetup_rsvp UNIQUE (meetup_id, user_id)
);

CREATE INDEX idx_meetup_meet_date ON meetup (meet_date DESC);
CREATE INDEX idx_meetup_status ON meetup (status);
CREATE INDEX idx_meetup_rsvp_meetup ON meetup_rsvp (meetup_id);
