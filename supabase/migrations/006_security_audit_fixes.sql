-- ============================================================
-- 006: Security audit fixes
-- ============================================================

-- CRITICAL: Prevent privilege escalation via profile self-update.
-- The existing policy "Users can update own profile" uses only USING
-- without WITH CHECK, meaning a user can set role = 'admin' on their
-- own profile. Replace with a policy that blocks role changes.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');

-- HIGH: Harden update_upvote_count() with fixed search_path.
-- This is a SECURITY DEFINER function that was missing search_path,
-- making it vulnerable to search-path hijacking.
CREATE OR REPLACE FUNCTION update_upvote_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps SET upvote_count = upvote_count + 1 WHERE id = new.app_id;
    RETURN new;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps SET upvote_count = upvote_count - 1 WHERE id = old.app_id;
    RETURN old;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
