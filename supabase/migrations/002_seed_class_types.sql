-- ============================================================
-- Seed: class_types
-- Run this in: Supabase Dashboard → SQL Editor
-- Must match the list in app/sign-up/page.tsx exactly.
-- ON CONFLICT DO NOTHING makes it safe to re-run.
-- ============================================================

INSERT INTO public.class_types (name) VALUES
  ('Hatha'),
  ('Ashtanga'),
  ('Meditation'),
  ('Vinyasa'),
  ('Yin'),
  ('Restorative'),
  ('Beginner Yoga'),
  ('Somatic Flow'),
  ('Yoga Sculpt'),
  ('Core & Restore'),
  ('Core Barre'),
  ('Mat Pilates'),
  ('Strength & Conditioning')
ON CONFLICT (name) DO NOTHING;
