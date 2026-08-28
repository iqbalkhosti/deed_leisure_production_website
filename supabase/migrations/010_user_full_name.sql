-- Store the name supplied at sign-up for account-facing UI.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;

-- Backfill existing accounts where a name was already present in Auth metadata.
UPDATE public.users u
SET full_name = a.raw_user_meta_data->>'full_name'
FROM auth.users a
WHERE u.id = a.id
  AND COALESCE(u.full_name, '') = ''
  AND COALESCE(a.raw_user_meta_data->>'full_name', '') <> '';

-- Keep the profile record in sync when a new Auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, club_id, is_exec_approved)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    CASE
      WHEN NEW.raw_user_meta_data->>'club_id' IS NOT NULL
       AND NEW.raw_user_meta_data->>'club_id' <> ''
      THEN (NEW.raw_user_meta_data->>'club_id')::uuid
      ELSE NULL
    END,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  RETURN NEW;
END;
$$;
