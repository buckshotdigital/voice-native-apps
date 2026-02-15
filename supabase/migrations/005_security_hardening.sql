-- ============================================================
-- 005: Security hardening (audit findings 1-4)
-- ============================================================

-- FINDING 1: Drop the overly-permissive storage INSERT policy from 001.
-- It allows any authenticated user to upload to ANY path.
-- The stricter policy from 004 (auth_upload) restricts to userId/* folders.
DROP POLICY IF EXISTS "Authenticated users can upload app assets" ON storage.objects;

-- FINDING 2: Harden is_admin() with fixed search_path to prevent
-- search-path hijacking via SECURITY DEFINER.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- FINDING 3: Database-backed rate limiting (replaces in-memory per-instance Map).
-- Works across all serverless instances.
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  count int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
-- No RLS policies = no direct access; only via SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key text,
  p_max_requests int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_count int;
BEGIN
  -- Try to get existing record
  SELECT count, window_start INTO v_count, v_window_start
  FROM rate_limits WHERE key = p_key FOR UPDATE;

  IF NOT FOUND THEN
    -- First request for this key
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (p_key, 1, v_now)
    ON CONFLICT (key) DO UPDATE
      SET count = 1, window_start = v_now;
    RETURN true;
  END IF;

  -- Window expired — reset
  IF v_window_start < v_now - (p_window_seconds || ' seconds')::interval THEN
    UPDATE rate_limits SET count = 1, window_start = v_now WHERE key = p_key;
    RETURN true;
  END IF;

  -- Within window — check limit
  IF v_count >= p_max_requests THEN
    RETURN false;
  END IF;

  -- Increment
  UPDATE rate_limits SET count = count + 1 WHERE key = p_key;
  RETURN true;
END;
$$;

-- Periodic cleanup of expired entries (run via pg_cron or manual)
-- For now, create an index to keep lookups fast.
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);

-- FINDING 4: Atomic daily submission check+increment.
-- Prevents race condition between read and write.
CREATE OR REPLACE FUNCTION check_and_increment_submissions(
  p_user_id uuid,
  p_max_submissions int DEFAULT 3
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_count int;
BEGIN
  -- Atomic check-and-increment with row lock
  UPDATE profiles
  SET
    submissions_today = CASE
      WHEN last_submission_date = v_today THEN submissions_today + 1
      ELSE 1
    END,
    last_submission_date = v_today
  WHERE id = p_user_id
    AND (
      last_submission_date IS NULL
      OR last_submission_date != v_today
      OR submissions_today < p_max_submissions
    );

  IF NOT FOUND THEN
    -- Either user doesn't exist or they hit the limit
    RETURN false;
  END IF;

  RETURN true;
END;
$$;
