CREATE TABLE public.support_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL CHECK (char_length(question) BETWEEN 2 AND 200),
  answer text NOT NULL CHECK (char_length(answer) BETWEEN 2 AND 2000),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_faqs TO authenticated;
GRANT ALL ON public.support_faqs TO service_role;

ALTER TABLE public.support_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage support faqs" ON public.support_faqs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_support_faqs_updated_at
  BEFORE UPDATE ON public.support_faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.support_faqs (question, answer, sort_order) VALUES
('איך אני יכול לעקוב אחרי ההזמנה?', 'בעמוד המעקב רואים סטטוס חי של ההזמנה. תמיד לצרף את קישור המעקב האישי של הלקוח כקישור.', 1),
('איך משלמים בסוף התיקון?', 'משלמים בסוף התיקון, אחרי שהמכשיר עובד. אפשר לשלם באשראי, Apple Pay, Google Pay, Bit, PayBox, מזומן או העברה בנקאית ישירה.', 2),
('הטכנאי יכול לתקן ברכב שלו?', 'כן, הטכנאי יכול לתקן ברכב שלו ליד הבית או המשרד. זה מומלץ - חוסך ללקוח זמן, לא צריך לארח או לחכות, ומקבלים את המכשיר מתוקן ביד.', 3),
('מה להכין לפני שהטכנאי מגיע?', 'כדאי לגבות את המכשיר, לזכור את קוד הנעילה ולהיות זמינים בטלפון.', 4),
('כמה זמן לוקח התיקון?', 'רוב התיקונים (מסך, סוללה, שקע טעינה) לוקחים בערך 20-40 דקות במקום.', 5);