-- Seed: locations (for coverage_requests FKs and request-sub form)
-- Run in Supabase Dashboard → SQL Editor. Safe to re-run.
INSERT INTO public.locations (name) VALUES
  ('Carrboro Studio'),
  ('Durham Studio'),
  ('Chapel Hill Studio')
ON CONFLICT (name) DO NOTHING;
