-- ============================================================
-- Row Level Security (RLS) Policies
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Helper: check if the calling user is an admin ───────────────────────────
-- Using a SECURITY DEFINER function avoids the recursive RLS issue
-- (i.e. checking if a row in `profiles` has is_admin = true, while RLS
-- on `profiles` is itself active).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ─── profiles ─────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert their own profile row (called right after
-- supabase.auth.signUp).
CREATE POLICY "instructors_insert_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can read their own profile (needed to check approval status on login).
CREATE POLICY "instructors_select_own_profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (name, phone, notification preference…).
-- They cannot change is_admin or approved — those columns should be managed
-- by admin only; enforce that at the application layer in tRPC.
CREATE POLICY "instructors_update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read ALL profiles (needed for pending-approval dashboard).
CREATE POLICY "admins_select_all_profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Admins can update ANY profile (needed to flip approved = true).
CREATE POLICY "admins_update_all_profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- ─── instructor_qualifications ────────────────────────────────────────────────

ALTER TABLE public.instructor_qualifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own qualifications.
CREATE POLICY "instructors_select_own_qualifications"
  ON public.instructor_qualifications
  FOR SELECT
  USING (auth.uid() = instructor_id);

-- Users can insert their own qualifications (done during sign-up).
CREATE POLICY "instructors_insert_own_qualifications"
  ON public.instructor_qualifications
  FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

-- Users can delete their own qualifications (if they update their specialisations).
CREATE POLICY "instructors_delete_own_qualifications"
  ON public.instructor_qualifications
  FOR DELETE
  USING (auth.uid() = instructor_id);

-- Admins can read all qualifications.
CREATE POLICY "admins_select_all_qualifications"
  ON public.instructor_qualifications
  FOR SELECT
  USING (public.is_admin());

-- ─── coverage_requests ───────────────────────────────────────────────────────

ALTER TABLE public.coverage_requests ENABLE ROW LEVEL SECURITY;

-- Any approved instructor can view open coverage requests.
CREATE POLICY "approved_instructors_select_open_requests"
  ON public.coverage_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- An instructor can insert a request for a class they teach.
CREATE POLICY "instructors_insert_own_requests"
  ON public.coverage_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requested_by_instructor_id);

-- An instructor can update a request they created (e.g. cancel it).
CREATE POLICY "instructors_update_own_requests"
  ON public.coverage_requests
  FOR UPDATE
  USING (auth.uid() = requested_by_instructor_id);

-- Admins can update any request (approve class-type changes, etc.).
CREATE POLICY "admins_update_all_requests"
  ON public.coverage_requests
  FOR UPDATE
  USING (public.is_admin());

-- ─── class_types & locations (read-only for instructors) ──────────────────────

ALTER TABLE public.class_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_class_types"
  ON public.class_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_locations"
  ON public.locations
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
