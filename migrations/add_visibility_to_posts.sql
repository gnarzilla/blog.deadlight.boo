ALTER TABLE posts ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));
ALTER TABLE posts ADD COLUMN moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending', 'rejected'));
ALTER TABLE posts ADD COLUMN moderation_notes TEXT;
