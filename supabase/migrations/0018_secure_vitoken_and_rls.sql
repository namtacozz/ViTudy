-- ==============================================================================
-- Migration 0018: Secure ViToken Spending, Listings RLS Hardening & Real Content Columns
-- ==============================================================================

BEGIN;

-- 1. RPC: spend_vitoken (Authenticated user atomic debit)
CREATE OR REPLACE FUNCTION public.spend_vitoken(
    p_amount INT,
    p_type TEXT,
    p_description TEXT,
    p_reference TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_current_balance INT;
    v_balance_after INT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'unauthenticated';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'amount_must_be_positive';
    END IF;

    -- Idempotency check
    IF p_reference IS NOT NULL THEN
        SELECT balance_after INTO v_balance_after
        FROM public.vitoken_transactions
        WHERE reference = p_reference AND user_id = v_user_id;

        IF FOUND THEN
            RETURN v_balance_after;
        END IF;
    END IF;

    -- Lock row for update
    SELECT vitoken_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user_not_found';
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'insufficient_balance';
    END IF;

    v_balance_after := v_current_balance - p_amount;

    UPDATE public.profiles
    SET vitoken_balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_user_id;

    INSERT INTO public.vitoken_transactions (
        user_id, amount, balance_after, transaction_type, description, reference
    ) VALUES (
        v_user_id, -p_amount, v_balance_after, p_type, p_description, p_reference
    );

    RETURN v_balance_after;
END;
$$;

GRANT EXECUTE ON FUNCTION public.spend_vitoken(INT, TEXT, TEXT, TEXT) TO authenticated;

-- 2. Enhance know_inherit_listings for real content & preserve listings on account deletion
ALTER TABLE public.know_inherit_listings
    ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'Tổng hợp',
    ADD COLUMN IF NOT EXISTS doc_type TEXT NOT NULL DEFAULT 'paper' CHECK (doc_type IN ('paper', 'book', 'exam')),
    ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Sinh viên ViTudy',
    ADD COLUMN IF NOT EXISTS pages JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.know_inherit_listings
    ALTER COLUMN author_id DROP NOT NULL;

ALTER TABLE public.know_inherit_listings
    DROP CONSTRAINT IF EXISTS know_inherit_listings_author_id_fkey;

ALTER TABLE public.know_inherit_listings
    ADD CONSTRAINT know_inherit_listings_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Harden RLS on know_inherit_listings: prevent client-side arbitrary score/price spoofing
REVOKE INSERT, UPDATE ON public.know_inherit_listings FROM authenticated;
GRANT SELECT ON public.know_inherit_listings TO anon, authenticated;

-- 4. RPC: publish_know_inherit_listing (Server-validated publication)
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
    v_score INT;
    v_tier TEXT;
    v_price INT;
    v_listing_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'unauthenticated';
    END IF;

    v_page_count := COALESCE(jsonb_array_length(p_pages), 1);
    -- Server-side deterministic baseline quality evaluation
    v_score := LEAST(98, GREATEST(60, 65 + (v_page_count * 3)));

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
