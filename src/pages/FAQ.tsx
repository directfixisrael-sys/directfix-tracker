import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEO from "@/components/SEO";
import { seo } from "@/lib/seoData";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "כמה עולה החלפת מסך אייפון?",
    a: "מחיר החלפת מסך אייפון משתנה לפי דגם. אצלנו תמצאו מחירים שקופים ללא הפתעות, החל מ-₪399 לדגמים ישנים ועד ₪1,890 לדגמי Pro Max החדשים. ניתן לראות את המחיר המדויק לדגם שלכם בעמוד ההזמנה."
  },
  {
    q: "כמה זמן לוקח תיקון אייפון?",
    a: "רוב התיקונים (החלפת מסך, סוללה, שקע טעינה) מתבצעים במקום תוך 20-40 דקות. הטכנאי מגיע אליכם הביתה או למשרד עם כל הציוד הנדרש."
  },
  {
    q: "באילו אזורים אתם נותנים שירות?",
    a: "אנחנו נותנים שירות בכל מרכז הארץ וגוש דן - מנתניה בצפון ועד מודיעין בדרום. כולל תל אביב, רמת גן, גבעתיים, הרצליה, רעננה, כפר סבא, פתח תקווה, ראשון לציון, חולון, בת ים, רחובות ועוד."
  },
  {
    q: "איזו אחריות אתם נותנים על התיקון?",
    a: "אנחנו מעניקים אחריות מלאה על כל תיקון: 12 חודשים על החלפת סוללה, 6 חודשים על שקע טעינה, ו-3 חודשים על החלפת מסך (לא כולל נזק שבירה). האחריות דיגיטלית ונשמרת באיזור האישי שלכם."
  },
  {
    q: "האם החלקים שלכם מקוריים?",
    a: "אנחנו מציעים שני סוגי מסכים: מסך מקורי (Original) ומסך תואם איכותי (Compatible). הסוללות שלנו מקוריות בלבד עם אחריות 12 חודשים. כל החלקים נבדקים ועומדים בסטנדרטים הגבוהים ביותר."
  },
  {
    q: "איך משלמים על התיקון?",
    a: "ניתן לשלם בכרטיס אשראי, Apple Pay, Google Pay, Bit, PayBox או במזומן ישירות לטכנאי. תשלום מקדמה אונליין מאובטח דרך מערכת סליקה PCI-DSS."
  },
  {
    q: "האם אתם מתקנים גם iPad?",
    a: "כן, אנחנו מתקנים מסכים של כל דגמי ה-iPad: iPad רגיל, iPad Air, iPad Pro ו-iPad mini. השירות מתבצע עד הבית באותם תנאים."
  },
  {
    q: "מה קורה אם המכשיר לא ניתן לתיקון?",
    a: "במקרה נדיר שהמכשיר לא ניתן לתיקון, לא תחויבו על השירות. הטכנאי יסביר לכם את המצב ויציע פתרונות חלופיים כמו רכישת מכשיר חדש או החלפת לוח אם."
  },
  {
    q: "האם ניתן לקבוע תור לאותו היום?",
    a: "כן, ברוב המקרים אנחנו מצליחים להגיע באותו היום, ולפעמים אפילו תוך שעה מרגע ההזמנה. הזמן המינימלי לתיאום הוא 40 דקות מרגע ההזמנה."
  },
  {
    q: "האם המידע שעל המכשיר שלי בטוח?",
    a: "בהחלט. הטכנאי לא ניגש למידע האישי שלכם, התיקון מתבצע מולכם, ואין צורך בסיסמת המכשיר ברוב המקרים. אנחנו מקפידים על מדיניות פרטיות מחמירה."
  }
];

const FAQ = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a }
    }))
  };

  return (
    <>
      <SEO
        title="שאלות נפוצות - תיקון אייפון | DirectFix"
        description="תשובות לשאלות הנפוצות ביותר על תיקון אייפון: מחירים, אזורי שירות, אחריות, זמני תיקון וחלקים מקוריים. כל מה שרציתם לדעת על שירות DirectFix."
        keywords="שאלות נפוצות תיקון אייפון, מחיר תיקון אייפון, אחריות תיקון, אזורי שירות, זמן תיקון אייפון"
        url="https://track.directfix.co.il/faq"
        jsonLd={jsonLd}
      />
      <main className="container max-w-3xl mx-auto px-4 py-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">שאלות נפוצות</h1>
          <p className="text-lg text-muted-foreground">
            כל מה שרציתם לדעת על תיקון אייפון בבית עם DirectFix
          </p>
        </header>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-border rounded-2xl px-5 shadow-sm"
            >
              <AccordionTrigger className="text-right text-lg font-semibold hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section className="mt-12 text-center bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-3">לא מצאתם תשובה?</h2>
          <p className="text-muted-foreground mb-6">צרו איתנו קשר או הזמינו תיקון עכשיו</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/order">הזמינו תיקון</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="tel:033106020">התקשרו: 03-3106020</a>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
};

export default FAQ;
