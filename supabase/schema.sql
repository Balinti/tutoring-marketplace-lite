-- Morning Immersion Sprint - Database Schema
-- Run this after Supabase project is created

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohorts table
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  language TEXT NOT NULL DEFAULT 'English',
  level_range TEXT DEFAULT 'Intermediate',
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  meeting_time_local TEXT DEFAULT '7:30 AM',
  meeting_timezone TEXT DEFAULT 'America/New_York',
  meeting_link TEXT,
  seat_cap INTEGER DEFAULT 15,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohort enrollments
CREATE TABLE IF NOT EXISTS cohort_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'canceled')),
  stripe_checkout_session_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

-- Drills table
CREATE TABLE IF NOT EXISTS drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  prompt_text TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  level TEXT DEFAULT 'Intermediate',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drill submissions
CREATE TABLE IF NOT EXISTS drill_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id UUID REFERENCES drills(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  audio_path TEXT,
  transcript TEXT,
  feedback_json JSONB,
  score_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  prompt_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, week_number)
);

-- Assessment submissions
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  audio_path TEXT,
  transcript TEXT,
  ai_feedback_json JSONB,
  instructor_feedback_json JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, user_id)
);

-- Subscriptions table (for Stripe tracking)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App settings (key-value store)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_drill_submissions_user ON drill_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_drill_submissions_drill ON drill_submissions(drill_id);
CREATE INDEX IF NOT EXISTS idx_drills_date ON drills(date);
CREATE INDEX IF NOT EXISTS idx_cohort_enrollments_user ON cohort_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_user ON assessment_submissions(user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default app settings
INSERT INTO app_settings (key, value) VALUES
  ('active_cohort_id', 'null'::jsonb),
  ('open_room_link', '"https://meet.google.com/abc-defg-hij"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert a sample cohort (starts in a week, runs 4 weeks)
INSERT INTO cohorts (slug, language, level_range, start_at, end_at, meeting_time_local, meeting_timezone, meeting_link, seat_cap, active)
VALUES (
  'english-sprint-2025-02',
  'English',
  'Intermediate',
  (CURRENT_DATE + INTERVAL '7 days')::timestamptz,
  (CURRENT_DATE + INTERVAL '35 days')::timestamptz,
  '7:30 AM',
  'America/New_York',
  'https://meet.google.com/morning-sprint-live',
  15,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert sample drills for the next 7 days
INSERT INTO drills (date, prompt_text, language, level) VALUES
  (CURRENT_DATE, 'Describe your morning routine. What do you do from the moment you wake up until you leave for work or start your day?', 'English', 'Intermediate'),
  (CURRENT_DATE + 1, 'Talk about a memorable trip you took. Where did you go, who were you with, and what made it special?', 'English', 'Intermediate'),
  (CURRENT_DATE + 2, 'Explain your favorite hobby to someone who has never tried it. Why do you enjoy it and how did you get started?', 'English', 'Intermediate'),
  (CURRENT_DATE + 3, 'Describe the neighborhood you live in. What do you like about it and what would you change?', 'English', 'Beginner'),
  (CURRENT_DATE + 4, 'If you could have dinner with any historical figure, who would you choose and what would you talk about?', 'English', 'Advanced'),
  (CURRENT_DATE + 5, 'Talk about a skill you would like to learn. Why is it important to you and how would you go about learning it?', 'English', 'Intermediate'),
  (CURRENT_DATE + 6, 'Describe your ideal weekend. What activities would you do and who would you spend it with?', 'English', 'Beginner')
ON CONFLICT DO NOTHING;

-- Insert sample assessments for the cohort
DO $$
DECLARE
  cohort_uuid UUID;
BEGIN
  SELECT id INTO cohort_uuid FROM cohorts WHERE slug = 'english-sprint-2025-02' LIMIT 1;

  IF cohort_uuid IS NOT NULL THEN
    INSERT INTO assessments (cohort_id, week_number, prompt_text) VALUES
      (cohort_uuid, 1, 'Tell us about yourself. Share your background, your interests, and why you decided to join this language learning program. What are your goals for the next 4 weeks?'),
      (cohort_uuid, 2, 'Describe a challenge you have faced in your life and how you overcame it. What did you learn from this experience?'),
      (cohort_uuid, 3, 'If you could change one thing about your city or town, what would it be and why? Explain your reasoning and how this change would benefit the community.'),
      (cohort_uuid, 4, 'Reflect on your progress over the past 4 weeks. What improvements have you noticed in your speaking ability? What areas do you want to continue working on?')
    ON CONFLICT (cohort_id, week_number) DO NOTHING;

    -- Update app settings with active cohort
    UPDATE app_settings SET value = to_jsonb(cohort_uuid::text) WHERE key = 'active_cohort_id';
  END IF;
END $$;
