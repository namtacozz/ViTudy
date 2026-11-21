-- ==============================================================================
-- Migration 0023: Security Hardening (BUG-1 admin_simulate_payment, BUG-2 join_activity_room)
-- ==============================================================================

BEGIN;

-- 1. BUG-1: Revoke client execution of admin_simulate_payment from authenticated/anon/PUBLIC
REVOKE ALL ON FUNCTION public.admin_simulate_payment(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_simulate_payment(UUID) TO service_role;

-- 2. BUG-2: Harden join_activity_room to enforce workspace access & fix study_spaces columns
CREATE OR REPLACE FUNCTION public.join_activity_room(
  p_instance_id TEXT,
  p_space_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_space_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Check if an activity room already exists for this instance_id
  SELECT space_id INTO v_space_id
  FROM public.activity_rooms
  WHERE instance_id = p_instance_id;

  IF v_space_id IS NOT NULL THEN
    INSERT INTO public.space_members (space_id, user_id, role)
    VALUES (v_space_id, v_user_id, 'editor')
    ON CONFLICT (space_id, user_id) DO NOTHING;

    RETURN v_space_id;
  END IF;

  IF p_space_id IS NOT NULL THEN
    -- Enforce authorization: caller must own, be a member of, or have public access to p_space_id
    IF NOT EXISTS (
      SELECT 1 FROM public.study_spaces s
      WHERE s.id = p_space_id
        AND (
          s.owner_id = v_user_id
          OR s.is_public = true
          OR EXISTS (
            SELECT 1 FROM public.space_members m
            WHERE m.space_id = p_space_id AND m.user_id = v_user_id
          )
        )
    ) THEN
      RAISE EXCEPTION 'forbidden';
    END IF;
    v_space_id := p_space_id;
  ELSE
    INSERT INTO public.study_spaces (owner_id, name, subject, camera_transform)
    VALUES (v_user_id, 'Discord Study Space', 'Học nhóm', '{"zoom":1,"panX":0,"panY":0}'::jsonb)
    RETURNING id INTO v_space_id;
  END IF;

  INSERT INTO public.activity_rooms (instance_id, space_id, created_by)
  VALUES (p_instance_id, v_space_id, v_user_id)
  ON CONFLICT (instance_id) DO NOTHING;

  SELECT space_id INTO v_space_id
  FROM public.activity_rooms
  WHERE instance_id = p_instance_id;

  INSERT INTO public.space_members (space_id, user_id, role)
  VALUES (
    v_space_id,
    v_user_id,
    CASE
      WHEN EXISTS (SELECT 1 FROM public.study_spaces s WHERE s.id = v_space_id AND s.owner_id = v_user_id)
        THEN 'owner'
      ELSE 'editor'
    END
  )
  ON CONFLICT (space_id, user_id) DO NOTHING;

  RETURN v_space_id;
END;
$$;

COMMIT;
