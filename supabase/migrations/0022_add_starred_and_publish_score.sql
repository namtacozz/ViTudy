-- Migration 0022: Persist study_spaces.starred and align publish_know_inherit_listing AI score formula

BEGIN;

-- 1. Add starred column to study_spaces for persistent favorite desks across logins
ALTER TABLE public.study_spaces
    ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Align publish_know_inherit_listing AI score formula with KnowInheritPublishModal
CREATE OR REPLACE FUNCTION public.publish_know_inherit_listing(
    p_title TEXT,
    p_summary TEXT,
    p_doc_type TEXT,
    p_subject TEXT,
    p_author_name TEXT,
    p_preview_content TEXT,
    p_pages JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_page_count INT;
    v_total_words INT := 0;
    v_page JSONB;
    v_score INT;
    v_tier TEXT;
    v_price INT;
    v_listing_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'unauthenticated';
    END IF;

    v_page_count := GREATEST(COALESCE(jsonb_array_length(p_pages), 1), 1);

    IF p_pages IS NOT NULL AND jsonb_typeof(p_pages) = 'array' THEN
        FOR v_page IN SELECT * FROM jsonb_array_elements(p_pages)
        LOOP
            v_total_words := v_total_words + COALESCE(
                array_length(
                    regexp_split_to_array(
                        NULLIF(TRIM(COALESCE(v_page->>'text', '')), ''),
                        '\s+'
                    ),
                    1
                ),
                0
            );
        END LOOP;
    END IF;

    -- Matches KnowInheritPublishModal: Math.min(98, Math.max(72, Math.floor(70 + (pageCount * 3) + (totalWords / 250))))
    v_score := LEAST(98, GREATEST(72, FLOOR(70 + (v_page_count * 3) + (v_total_words / 250.0))::INT));

    IF p_doc_type = 'paper' THEN
        v_price := 15;
        v_tier := 'B';
    ELSIF p_doc_type = 'exam' THEN
        v_price := 30;
        v_tier := 'A';
    ELSE
        v_price := 50;
        v_tier := 'S';
    END IF;

    INSERT INTO public.know_inherit_listings (
        author_id, author_name, title, summary, doc_type, subject,
        tier, ai_quality_score, price, preview_content, full_content_url, pages, status
    ) VALUES (
        v_user_id,
        COALESCE(NULLIF(TRIM(p_author_name), ''), 'Sinh viên ViTudy'),
        TRIM(p_title),
        TRIM(p_summary),
        p_doc_type,
        COALESCE(NULLIF(TRIM(p_subject), ''), 'Tổng hợp'),
        v_tier,
        v_score,
        v_price,
        LEFT(COALESCE(p_preview_content, ''), 400),
        'supabase://know_inherit/' || gen_random_uuid()::text,
        COALESCE(p_pages, '[]'::jsonb),
        'published'
    )
    RETURNING id INTO v_listing_id;

    RETURN v_listing_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_know_inherit_listing(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;

COMMIT;
