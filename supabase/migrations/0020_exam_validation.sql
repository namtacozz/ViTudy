-- Migration 0020: Server-side validation for submit_exam_attempt (chống giả mạo điểm từ client)

CREATE OR REPLACE FUNCTION public.submit_exam_attempt(
  p_document_id UUID,
  p_score NUMERIC,
  p_total INT,
  p_correct INT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_id UUID;
  v_safe_score NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  IF p_total IS NULL OR p_total <= 0 OR p_total > 500 THEN
    RAISE EXCEPTION 'invalid_total_questions';
  END IF;

  IF p_correct IS NULL OR p_correct < 0 OR p_correct > p_total THEN
    RAISE EXCEPTION 'invalid_correct_count';
  END IF;

  -- Tính điểm chuẩn hóa hệ 10 trên server, không tin cậy giá trị p_score thô nếu vượt biên
  v_safe_score := ROUND((p_correct::NUMERIC / p_total::NUMERIC) * 10, 2);

  INSERT INTO public.exam_attempts (user_id, document_id, score, total, correct)
  VALUES (v_user_id, p_document_id, v_safe_score, p_total, p_correct)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
