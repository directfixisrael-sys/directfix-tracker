import { ArrowRight, Shield, FileText, AlertTriangle, Scale, Phone, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-extrabold text-foreground">תנאי שימוש</h1>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              1. כללי
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>ברוכים הבאים לאפליקציית דיירקט פיקס ("האפליקציה"). האפליקציה מופעלת על ידי דיירקט פיקס - שירותי תיקון מכשירים ניידים ("החברה").</li>
              <li>השימוש באפליקציה מהווה <strong className="text-foreground">הסכמה מלאה לתנאי שימוש אלה</strong>. אם אינך מסכים/ה לתנאים, אנא הימנע/י משימוש באפליקציה.</li>
              <li>החברה רשאית לעדכן תנאים אלה מעת לעת. המשך השימוש לאחר עדכון מהווה הסכמה לתנאים המעודכנים.</li>
              <li>תנאי שימוש אלה חלים על כלל השירותים המוצעים דרך האפליקציה, לרבות הזמנת תיקונים, מעקב הזמנות, רכישת מכשירים, העברת מידע וייעוץ.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              2. השירותים
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>האפליקציה מאפשרת הזמנת שירותי תיקון למכשירים ניידים (אייפון ואחרים), כולל החלפת מסכים, סוללות, שקעי טעינה, זכוכיות אחוריות ועוד.</li>
              <li>השירות ניתן <strong className="text-foreground">עד בית הלקוח</strong> או בכל מיקום אחר שנקבע בעת ההזמנה.</li>
              <li>זמני ההגעה המצוינים הם <strong className="text-foreground">הערכה בלבד</strong> ואינם מהווים התחייבות. זמני ההגעה עשויים להשתנות בהתאם לעומס, מזג אוויר, זמינות חלקים ומיקום גיאוגרפי.</li>
              <li>החברה שומרת לעצמה את הזכות לסרב לספק שירות בכל מקרה שבו לא ניתן לבצע את התיקון באופן בטוח או מקצועי.</li>
              <li>מחירי השירות כפי שמוצגים באפליקציה הם <strong className="text-foreground">מחירים סופיים</strong> הכוללים חלקים ועבודה, אלא אם צוין אחרת.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              3. אחריות על תיקונים
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>כל תיקון מלווה באחריות כפי שמצוין בתעודת האחריות הדיגיטלית שתישלח ללקוח בסיום התיקון.</li>
              <li>האחריות חלה על <strong className="text-foreground">התקלה שתוקנה בלבד</strong> ולא על תקלות חדשות, נזקי נוזלים, נפילות, או שימוש לא סביר.</li>
              <li>מימוש האחריות מותנה בכך שהמכשיר לא נפתח או תוקן על ידי גורם אחר לאחר התיקון שבוצע על ידי דיירקט פיקס.</li>
              <li>תקופת האחריות מתחילה ממועד סיום התיקון ומסתיימת בתאריך הנקוב בתעודת האחריות.</li>
              <li>החברה אינה אחראית לאובדן מידע כתוצאה מהתיקון. על הלקוח לגבות את המכשיר לפני התיקון.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              4. הזמנות ותשלומים
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>הזמנת תיקון דרך האפליקציה מהווה <strong className="text-foreground">הסכמה לביצוע העבודה ולתשלום</strong> בהתאם למחיר שהוצג.</li>
              <li>התשלום יתבצע באמצעות כרטיס אשראי, מזומן, או כל אמצעי תשלום אחר שיוסכם.</li>
              <li>ביטול הזמנה אפשרי <strong className="text-foreground">ללא חיוב</strong> כל עוד הטכנאי לא יצא לדרך. לאחר יציאת הטכנאי, ייתכן חיוב דמי הגעה.</li>
              <li>במקרה של תשלום מראש באפליקציה, ההחזר יתבצע לאמצעי התשלום המקורי תוך 14 ימי עסקים.</li>
              <li>החשבונית תישלח למייל או לטלפון של הלקוח בתום התיקון.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              5. פרטיות ומידע אישי
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>החברה אוספת מידע אישי (שם, טלפון, כתובת, מייל) <strong className="text-foreground">לצורך מתן השירות בלבד</strong>.</li>
              <li>המידע נשמר באופן מאובטח ולא יועבר לצדדים שלישיים, למעט כנדרש לצורך מתן השירות (כגון שליחת הודעות סטטוס) או כנדרש בחוק.</li>
              <li>הלקוח רשאי לבקש עיון, תיקון, או מחיקה של המידע האישי שלו בכל עת על ידי פנייה לשירות הלקוחות.</li>
              <li>האפליקציה עשויה להשתמש בעוגיות (Cookies) ונתוני אנליטיקה לצורך שיפור חוויית המשתמש.</li>
              <li>בהזמנת שירות, הלקוח מאשר לחברה ליצור עימו קשר באמצעות WhatsApp, טלפון, SMS ומייל לצורך תיאום השירות ועדכוני סטטוס.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              6. הגבלת אחריות
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>החברה אינה אחראית לנזקים עקיפים, תוצאתיים, או מיוחדים הנובעים מהשימוש באפליקציה או מהשירותים.</li>
              <li>החברה אינה אחראית לזמינות האפליקציה באופן רציף וללא הפרעות, ותעשה מאמץ סביר לשמור על פעילות תקינה.</li>
              <li>בכל מקרה, <strong className="text-foreground">אחריות החברה מוגבלת לסכום ששולם</strong> עבור השירות הספציפי.</li>
              <li>החברה אינה אחראית לנזקים שנגרמו כתוצאה מאי-דיוק במידע שסיפק הלקוח (כגון כתובת שגויה, תיאור תקלה לא מדויק).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              7. קניין רוחני
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>כל התכנים, העיצובים, הלוגו, הטקסטים והתמונות באפליקציה הם <strong className="text-foreground">רכושה הבלעדי של החברה</strong>.</li>
              <li>אין להעתיק, לשכפל, להפיץ, או לעשות שימוש מסחרי בתכנים ללא אישור מראש בכתב מהחברה.</li>
              <li>השם "דיירקט פיקס" (DirectFix) והלוגו הם סימנים מסחריים רשומים של החברה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              8. שימוש ראוי
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>המשתמש מתחייב להשתמש באפליקציה <strong className="text-foreground">למטרות חוקיות בלבד</strong>.</li>
              <li>אסור להזין מידע שגוי, מטעה, או מזויף באפליקציה.</li>
              <li>אסור לנסות לגשת למידע של משתמשים אחרים, לפרוץ למערכות החברה, או לבצע פעולות שעלולות לפגוע בפעילות האפליקציה.</li>
              <li>החברה רשאית להשעות או לחסום את הגישה לאפליקציה של משתמשים שמפרים תנאים אלה.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              9. מעקב הזמנות ואזור לקוח
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>האפליקציה מאפשרת מעקב בזמן אמת אחר סטטוס ההזמנה ומיקום הטכנאי.</li>
              <li>מידע המעקב מוצג <strong className="text-foreground">להערכה בלבד</strong> וייתכנו אי-דיוקים בשל עיכובים ברשת או בתקשורת.</li>
              <li>גישה לפרטי ההזמנה מותנית באימות זהות באמצעות מספר טלפון וסיסמה.</li>
              <li>הלקוח אחראי לשמור על סודיות פרטי הגישה שלו ולא להעבירם לאחרים.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              10. דין חל וסמכות שיפוט
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>תנאי שימוש אלה כפופים <strong className="text-foreground">לדיני מדינת ישראל</strong>.</li>
              <li>כל סכסוך הנובע מהשימוש באפליקציה יידון בבתי המשפט המוסמכים במחוז מרכז בלבד.</li>
              <li>במקרה של סתירה בין תנאים אלה לבין תנאים ספציפיים של שירות מסוים, התנאים הספציפיים יגברו.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              11. יצירת קשר
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed list-disc pr-5">
              <li>לשאלות, בירורים, או תלונות בנוגע לתנאי השימוש או לשירות, ניתן לפנות אלינו:</li>
              <li><strong className="text-foreground">טלפון:</strong> 050-000-0000</li>
              <li><strong className="text-foreground">WhatsApp:</strong> לחצו על כפתור הוואטסאפ באפליקציה</li>
              <li><strong className="text-foreground">אתר:</strong> directfix.co.il</li>
            </ul>
          </section>

          <section className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              תנאי שימוש אלה עודכנו לאחרונה במרץ 2026. השימוש באפליקציה לאחר תאריך זה מהווה הסכמה לתנאים המעודכנים.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
