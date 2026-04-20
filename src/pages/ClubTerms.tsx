import { ArrowRight, Award, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import SEO from "@/components/SEO";
import { seo } from "@/lib/seoData";

const ClubTerms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO {...seo.clubTerms} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-extrabold text-foreground">תקנון מועדון הלקוחות</h1>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              1. כללי
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>מועדון הלקוחות של דיירקט פיקס ("המועדון") מופעל על ידי דיירקט פיקס - שירותי תיקון מכשירים ניידים.</li>
              <li>ההצטרפות למועדון היא <strong className="text-foreground">בחינם לחלוטין</strong> וללא כל התחייבות.</li>
              <li>ההצטרפות למועדון מהווה הסכמה לתנאי תקנון זה.</li>
              <li>ניתן לבטל את החברות במועדון בכל עת על ידי פנייה לשירות הלקוחות.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              2. צבירת נקודות
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>על כל 100 ש"ח בתיקון, חבר המועדון יצבור 10 נקודות.</li>
              <li>כל נקודה שווה 0.50 ש"ח הנחה.</li>
              <li>הנקודות נצברות אוטומטית לפי מספר הטלפון של חבר המועדון.</li>
              <li>הנקודות אינן ניתנות להעברה, מכירה, או המרה למזומן.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              3. מימוש נקודות
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>ניתן לממש את הנקודות <strong className="text-foreground">בכל סניפי ושירותי דיירקט פיקס בלבד</strong>.</li>
              <li>הנקודות אינן תקפות אצל ספקי שירות אחרים.</li>
              <li>הנקודות ממומשות אוטומטית בהזמנה הבאה של חבר המועדון.</li>
              <li>מימוש נקודות לא יפחית את מחיר ההזמנה מתחת ל-0 ש"ח.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              4. תוקף נקודות
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>הנקודות תקפות למשך <strong className="text-foreground">24 חודשים</strong> ממועד הצבירה.</li>
              <li>נקודות שלא מומשו בתוך 24 חודשים יפוגו באופן אוטומטי.</li>
              <li>דיירקט פיקס רשאית לשנות את תקופת התוקף בהודעה מראש.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              5. הטבות חברי מועדון
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>מבצעים והנחות בלעדיות לחברי מועדון.</li>
              <li>עדיפות בתורים ושירות מועדף.</li>
              <li>הארכת אחריות בונוס על תיקונים.</li>
              <li>עדכונים על מבצעים ומוצרים חדשים.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              6. דיוור ותקשורת שיווקית
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>בהצטרפות למועדון, חבר המועדון <strong className="text-foreground">מאשר לדיירקט פיקס לשלוח לו הודעות שיווקיות</strong>, לרבות מבצעים, הנחות, עדכונים, ברכות לחגים ותוכן פרסומי.</li>
              <li>ההודעות ישלחו באמצעות WhatsApp, SMS, אימייל או כל אמצעי תקשורת אחר.</li>
              <li>ניתן לבטל את קבלת ההודעות השיווקיות בכל עת על ידי פנייה לשירות הלקוחות, מבלי לפגוע בחברות במועדון.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              7. פרטיות ומידע אישי
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>המידע האישי של חברי המועדון ישמש לצורך ניהול המועדון, מתן הטבות, ושליחת תקשורת שיווקית בלבד.</li>
              <li>דיירקט פיקס לא תעביר מידע אישי לצדדים שלישיים, למעט כנדרש בחוק.</li>
              <li>חבר המועדון רשאי לבקש עיון, תיקון, או מחיקה של המידע האישי שלו בכל עת.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              8. שינויים ועדכונים
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>דיירקט פיקס רשאית <strong className="text-foreground">לשנות, לעדכן או להפסיק את תוכנית המועדון</strong> בכל עת, בכפוף לדין.</li>
              <li>שינויים מהותיים יעודכנו לחברי המועדון מראש.</li>
              <li>המשך חברות במועדון לאחר עדכון התקנון מהווה הסכמה לתנאים המעודכנים.</li>
            </ul>
          </section>

          <section className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              תקנון זה עודכן לאחרונה במרץ 2026. לשאלות ובירורים ניתן לפנות לשירות הלקוחות של דיירקט פיקס.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClubTerms;
