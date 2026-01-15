-- Morning Immersion Sprint - Row Level Security Policies
-- Run this AFTER schema.sql

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Allow insert during signup (handled by trigger, but allow for edge cases)
CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- COHORTS POLICIES
-- =============================================

-- Everyone can view active cohorts
CREATE POLICY "Anyone can view active cohorts"
  ON cohorts FOR SELECT
  USING (active = true);

-- Admins can manage cohorts
CREATE POLICY "Admins can manage cohorts"
  ON cohorts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- COHORT ENROLLMENTS POLICIES
-- =============================================

-- Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
  ON cohort_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
  ON cohort_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role can insert (for webhook)
-- Note: In production, use service role key for inserts via API
CREATE POLICY "Service role can insert enrollments"
  ON cohort_enrollments FOR INSERT
  WITH CHECK (true);

-- =============================================
-- DRILLS POLICIES
-- =============================================

-- Everyone can view drills
CREATE POLICY "Anyone can view drills"
  ON drills FOR SELECT
  USING (true);

-- Admins can manage drills
CREATE POLICY "Admins can manage drills"
  ON drills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- DRILL SUBMISSIONS POLICIES
-- =============================================

-- Users can view their own submissions
CREATE POLICY "Users can view own drill submissions"
  ON drill_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own drill submissions"
  ON drill_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own submissions
CREATE POLICY "Users can update own drill submissions"
  ON drill_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all drill submissions"
  ON drill_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- ASSESSMENTS POLICIES
-- =============================================

-- Anyone can view assessments (simplification for MVP)
CREATE POLICY "Anyone can view assessments"
  ON assessments FOR SELECT
  USING (true);

-- Admins can manage assessments
CREATE POLICY "Admins can manage assessments"
  ON assessments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- ASSESSMENT SUBMISSIONS POLICIES
-- =============================================

-- Users can view their own assessment submissions
CREATE POLICY "Users can view own assessment submissions"
  ON assessment_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own assessment submissions"
  ON assessment_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own submissions (before published)
CREATE POLICY "Users can update own assessment submissions"
  ON assessment_submissions FOR UPDATE
  USING (auth.uid() = user_id AND published_at IS NULL);

-- Admins can view and update all submissions
CREATE POLICY "Admins can manage all assessment submissions"
  ON assessment_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- SUBSCRIPTIONS POLICIES
-- =============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role updates subscriptions (via webhook API)
-- No direct user update policy

-- =============================================
-- APP SETTINGS POLICIES
-- =============================================

-- Anyone can read app settings
CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  USING (true);

-- Only admins can update app settings
CREATE POLICY "Admins can manage app settings"
  ON app_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Create audio bucket if not exists (run via Supabase dashboard or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', false);

-- Allow authenticated users to upload to their own folder
-- CREATE POLICY "Users can upload own audio"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'audio' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Allow users to read their own audio files
-- CREATE POLICY "Users can read own audio"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'audio' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Allow admins to read all audio files
-- CREATE POLICY "Admins can read all audio"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'audio' AND
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
--     )
--   );
