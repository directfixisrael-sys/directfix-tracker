INSERT INTO public.repair_types (name, description, icon, sort_order, is_active, is_phone_only, info_title, info_description)
VALUES ('תיקון רמקול', 'רמקול מקורי - עליון או תחתון', 'volume-2', 6, true, false, 'תיקון רמקול', 'החלפת רמקול מקורי - ניתן לבחור רמקול עליון (אפרכסת) או רמקול תחתון (רמקול הדיבור והמוזיקה).')
ON CONFLICT DO NOTHING;

INSERT INTO public.model_repair_prices (model_id, repair_type_id, price)
SELECT m.id, rt.id, 350
FROM public.iphone_models m
CROSS JOIN public.repair_types rt
WHERE rt.name = 'תיקון רמקול'
ON CONFLICT DO NOTHING;