-- ==============================================================================
-- Migration 0017: Align official ViToken packages
-- Nhẹ nhàng (20.000đ - 20 ViToken), Chăm chỉ (45.000đ - 50 ViToken),
-- Try hard (85.000đ - 100 ViToken), Nhóm (255.000đ - 300 ViToken)
-- ==============================================================================

BEGIN;

-- Vô hiệu hóa các gói cũ
UPDATE public.vitoken_packages SET enabled = false;

-- Cập nhật và kích hoạt 4 gói nạp chính thức
INSERT INTO public.vitoken_packages (id, label, token_amount, price_vnd, sort, enabled)
VALUES
    ('light', 'Nhẹ nhàng', 20, 20000, 1, true),
    ('diligent', 'Chăm chỉ', 50, 45000, 2, true),
    ('tryhard', 'Try hard', 100, 85000, 3, true),
    ('group', 'Nhóm', 300, 255000, 4, true)
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    token_amount = EXCLUDED.token_amount,
    price_vnd = EXCLUDED.price_vnd,
    sort = EXCLUDED.sort,
    enabled = true;

COMMIT;
