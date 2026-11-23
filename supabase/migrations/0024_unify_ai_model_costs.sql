-- Migration 0024: Thống nhất chi phí AI hệ thống ViTudy là 2 ViToken/lượt
-- Đồng bộ toàn diện giữa UI hiển thị và tiêu trừ thực tế

UPDATE public.ai_model_costs
SET vitoken_cost = 2,
    updated_at = NOW()
WHERE model IN ('gpt-4o-mini', 'gemini-1.5-flash');

INSERT INTO public.ai_model_costs (model, vitoken_cost, enabled, description)
VALUES 
    ('gpt-4o-mini', 2, true, 'Mô hình tiêu chuẩn hệ thống ViTudy'),
    ('gemini-1.5-flash', 2, true, 'Google Gemini 1.5 Flash tốc độ cao'),
    ('gpt-4o', 4, true, 'OpenAI GPT-4o cao cấp')
ON CONFLICT (model) DO UPDATE
SET vitoken_cost = EXCLUDED.vitoken_cost,
    enabled = EXCLUDED.enabled,
    description = EXCLUDED.description,
    updated_at = NOW();
