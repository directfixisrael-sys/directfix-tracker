/**
 * Centralized SEO data per route. Edit here to update meta tags everywhere.
 */

export const SITE = {
  origin: "https://track.directfix.co.il",
  name: "DirectFix - דיירקט פיקס",
  defaultImage: "/og-technician.png",
};

const url = (path: string) => `${SITE.origin}${path}`;

const baseService = {
  "@context": "https://schema.org",
  "@type": "Service",
  provider: {
    "@type": "LocalBusiness",
    name: SITE.name,
    telephone: "+972-3-3106020",
    url: SITE.origin,
  },
  areaServed: { "@type": "Place", name: "מרכז ישראל וגוש דן" },
};

export const seo = {
  home: {
    title: "דף הבית | דיירקט פיקס - תיקון אייפון עד הבית",
    description:
      "תיקון אייפון מקצועי עד הבית בכל גוש דן והמרכז. החלפת מסך, סוללה, גב זכוכית ושקע טעינה תוך דקות. אחריות מלאה, מחירים שקופים. הזמינו עכשיו.",
    keywords:
      "תיקון אייפון, תיקון אייפון עד הבית, החלפת מסך אייפון, החלפת סוללה אייפון, תיקון iPhone, טכנאי אייפון, תיקון אייפון תל אביב, תיקון אייפון רמת גן, דיירקט פיקס",
    url: url("/"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.origin,
        inLanguage: "he-IL",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE.origin}/order?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "כמה עולה החלפת מסך אייפון?", acceptedAnswer: { "@type": "Answer", text: "מחירי החלפת מסך אייפון נעים בין ₪399 לדגמים ישנים ועד ₪1,890 לדגמי Pro Max החדשים. המחיר המדויק מוצג בעמוד ההזמנה לפי הדגם שלכם." } },
          { "@type": "Question", name: "כמה זמן לוקח התיקון?", acceptedAnswer: { "@type": "Answer", text: "רוב התיקונים מתבצעים במקום תוך 20-40 דקות. הטכנאי מגיע אליכם הביתה או למשרד עם כל הציוד הנדרש." } },
          { "@type": "Question", name: "באילו אזורים אתם נותנים שירות?", acceptedAnswer: { "@type": "Answer", text: "אנחנו נותנים שירות בכל מרכז הארץ וגוש דן - מנתניה ועד מודיעין. כולל תל אביב, רמת גן, גבעתיים, הרצליה, רעננה, פתח תקווה, ראשון לציון, חולון ועוד." } },
          { "@type": "Question", name: "איזו אחריות אתם נותנים?", acceptedAnswer: { "@type": "Answer", text: "אחריות מלאה על כל תיקון: 12 חודשים על סוללה, 6 חודשים על שקע טעינה, ו-3 חודשים על מסך (לא כולל נזק שבירה)." } },
          { "@type": "Question", name: "האם החלקים מקוריים?", acceptedAnswer: { "@type": "Answer", text: "אנחנו מציעים מסך מקורי או תואם איכותי לבחירתכם. הסוללות שלנו מקוריות בלבד עם אחריות 12 חודשים." } },
        ],
      },
    ],
  },
  order: {
    title: "הזמנת תיקון | דיירקט פיקס",
    description:
      "בחרו דגם, סוג תיקון, מועד וכתובת - הטכנאי בדרך אליכם. החלפת מסך, סוללה, גב זכוכית ועוד. אחריות מלאה, תשלום מאובטח.",
    keywords: "הזמנת תיקון אייפון, מחיר החלפת מסך אייפון, מחיר סוללה אייפון, תיקון iPhone אונליין",
    url: url("/order"),
    jsonLd: {
      ...baseService,
      name: "הזמנת תיקון אייפון",
      description: "תיקון אייפון בבית הלקוח כולל החלפת מסך, סוללה, גב זכוכית ושקע טעינה.",
      serviceType: "תיקון אייפון",
    },
  },
  track: {
    title: "מעקב תיקון | דיירקט פיקס",
    description:
      "עקבו אחר התיקון שלכם בזמן אמת - סטטוס, מיקום הטכנאי, שעת הגעה משוערת והודעות ישירות. כניסה עם מספר טלפון.",
    keywords: "מעקב תיקון אייפון, סטטוס תיקון, איזור אישי דיירקט פיקס",
    url: url("/track"),
  },
  ipad: {
    title: "תיקון iPad | דיירקט פיקס",
    description:
      "החלפת מסך iPad מקורי במחיר משתלם, עד הבית, בגוש דן והמרכז. שירות לכל הדגמים: iPad, iPad Air, iPad Pro, iPad mini. אחריות מלאה.",
    keywords: "תיקון מסך iPad, החלפת מסך אייפד, תיקון iPad Pro, תיקון iPad Air, תיקון אייפד עד הבית",
    url: url("/ipad"),
    jsonLd: {
      ...baseService,
      name: "תיקון מסך iPad",
      description: "החלפת מסכי iPad בכל הדגמים בבית הלקוח.",
      serviceType: "תיקון iPad",
    },
  },
  battery: {
    title: "החלפת סוללה | דיירקט פיקס",
    description:
      "החלפת סוללה מקורית לאייפון עד הבית. שיפור משמעותי בחיי הסוללה, אחריות 12 חודשים. מבצע מיוחד - לזמן מוגבל.",
    keywords: "החלפת סוללה אייפון, סוללה מקורית אייפון, תוכנית סוללה, סוללה ל iPhone",
    url: url("/battery"),
    jsonLd: {
      ...baseService,
      name: "החלפת סוללת אייפון",
      description: "החלפת סוללה מקורית לאייפון עם אחריות 12 חודשים.",
      serviceType: "החלפת סוללה",
    },
  },
  consultation: {
    title: "שיחת ייעוץ | דיירקט פיקס",
    description:
      "שיחת ייעוץ אישית עם טכנאי מומחה למכשירי Apple - אבחון תקלות, מענה לשאלות והמלצות. שיחת חינם או שיחת פרימיום.",
    keywords: "ייעוץ אייפון, שיחת ייעוץ apple, טכנאי iPhone, אבחון תקלת אייפון",
    url: url("/consultation"),
    jsonLd: {
      ...baseService,
      name: "שיחת ייעוץ למכשירי Apple",
      serviceType: "ייעוץ טכני",
    },
  },
  dataTransfer: {
    title: "העברת מידע | דיירקט פיקס",
    description:
      "שירות העברת מידע בין מכשירים (iPhone, Android) עד הבית - אנשי קשר, תמונות, אפליקציות והודעות. ₪350, שירות ליום למחרת.",
    keywords: "העברת מידע אייפון, העברת נתונים iPhone, העברת תוכן בין מכשירים, העברת מידע android iPhone",
    url: url("/data-transfer"),
    jsonLd: {
      ...baseService,
      name: "העברת מידע בין מכשירים",
      serviceType: "Data Transfer",
      offers: { "@type": "Offer", price: "350", priceCurrency: "ILS" },
    },
  },
  devices: {
    title: "רכישת iPhone 17 | דיירקט פיקס",
    description:
      "iPhone 17 Pro Max חדש - הזמינו עכשיו עם מקדמה של ₪500 בלבד. כל הצבעים, כל הקיבולות, אספקה מהירה עד הבית.",
    keywords: "iPhone 17, iPhone 17 Pro Max, רכישת אייפון, אייפון חדש, אייפון 17 מחיר",
    url: url("/devices"),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "iPhone 17 Pro Max",
      brand: { "@type": "Brand", name: "Apple" },
      offers: {
        "@type": "Offer",
        priceCurrency: "ILS",
        price: "3899",
        availability: "https://schema.org/InStock",
        url: url("/devices"),
      },
    },
  },
  club: {
    title: "מועדון דיירקט פיקס | דיירקט פיקס",
    description:
      "הצטרפו למועדון DirectFix וקבלו 50 נקודות במתנה, הנחות בלעדיות, ייעוץ חינם, מתנת יום הולדת ואחריות מורחבת.",
    keywords: "מועדון לקוחות אייפון, הטבות תיקון iPhone, DirectFix Club",
    url: url("/club"),
  },
  aiAgent: {
    title: "נציג AI - דני | דיירקט פיקס",
    description:
      "שיחה ישירה עם נציג AI של דיירקט פיקס - מחירים, זמינות, ייעוץ ותיאום תיקון אייפון 24/7. ללא המתנה.",
    keywords: "AI נציג אייפון, צ'אט בוט תיקון, נציג חכם DirectFix",
    image: "/og-ai-agent.jpg",
    url: url("/ai-agent"),
  },
  store: {
    title: "חנות הטבות | דיירקט פיקס",
    description:
      "חנות בלעדית לחברי מועדון DirectFix - מימוש נקודות נאמנות לקניית אייפונים, אביזרים, כיסויים, מטענים ואוזניות.",
    keywords: "חנות הטבות, אביזרי אייפון, כיסויים אייפון, מטענים אייפון, אוזניות AirPods",
    url: url("/store"),
  },
  storeCart: {
    title: "סל קניות | דיירקט פיקס",
    description: "סל הקניות שלך בחנות DirectFix.",
    url: url("/store/cart"),
    noindex: true,
  },
  storeCheckout: {
    title: "תשלום | דיירקט פיקס",
    description: "השלמת רכישה בחנות DirectFix.",
    url: url("/store/checkout"),
    noindex: true,
  },
  terms: {
    title: "תקנון ותנאי שימוש | דיירקט פיקס",
    description: "תנאי השימוש, תקנון האחריות ומדיניות הפרטיות של DirectFix.",
    url: url("/terms"),
  },
  clubTerms: {
    title: "תקנון מועדון | דיירקט פיקס",
    description: "תקנון מועדון הלקוחות של DirectFix - הטבות, נקודות וזכויות חברים.",
    url: url("/club-terms"),
  },
  unsubscribe: {
    title: "הסרה מדיוור | דיירקט פיקס",
    description: "הסרה מרשימת הדיוור של DirectFix.",
    url: url("/unsubscribe"),
    noindex: true,
  },
  admin: {
    title: "פאנל ניהול | דיירקט פיקס",
    description: "פאנל ניהול פנימי של DirectFix.",
    url: url("/admin"),
    noindex: true,
  },
  faq: {
    title: "שאלות ותשובות | דיירקט פיקס",
    description: "שאלות נפוצות על שירותי DirectFix.",
    url: url("/faq"),
  },
  notFound: {
    title: "הדף לא נמצא | דיירקט פיקס",
    description: "הדף שחיפשתם לא נמצא. חזרו לדף הבית של DirectFix.",
    noindex: true,
  },
};

export type SeoKey = keyof typeof seo;
