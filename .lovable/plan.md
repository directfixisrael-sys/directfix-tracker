# תוכנית שיפורי עיצוב מקיפה

עבודה בשבעה גלים נפרדים כדי לשמור על יציבות ולאפשר בדיקה ביניים. כל גל עומד בפני עצמו ולא שובר קיים.

## גל 1 - חיזוק שפת העיצוב (בסיס לכל השאר)
- הוספת אנימציות חסרות ל-`tailwind.config.ts`: `fade-in`, `scale-in`, `slide-in-right`, `slide-up`, `enter`, `exit`.
- הוספת utility classes: `.hover-scale`, `.story-link`, `.press` (active:scale-[0.98]).
- חידוד טוקנים ב-`index.css`: shadows רכים יותר במצב כהה, ring עדין יותר, spacing scale אחיד.
- הגדרת radius אחיד לכפתורים/כרטיסים/inputs (rounded-2xl לכרטיסים, rounded-xl לכפתורים).

## גל 2 - Dark mode polish
- כיול ניגודיות: `--card` מעט בהיר יותר מ-`--background`, `--border` עדין יותר.
- shadows במצב כהה עם glow עדין במקום שחור מלא.
- וידוא ניגודיות טקסט משני (muted-foreground) לפי WCAG AA.

## גל 3 - היררכיה ויזואלית + טיפוגרפיה
- מבנה כותרות אחיד: H1 גדול ובולט, subtitle ב-muted-foreground קטן יותר.
- הגדלת ריווחים בין סקשנים בדפי `Index`, `NewRepairOrder`, `CustomerTracker`.
- הפחתת עומס: מיזוג/הסתרת אלמנטים משניים, שימוש בקבוצות (grouping) עם רקע section עדין.

## גל 4 - דף הבית (Hero חזק)
- Hero חדש עם CTA ראשי אחד גדול ("התחל הזמנת תיקון") ו-CTA משני קטן (מעקב הזמנה).
- כותרת ענקית + תת-כותרת + trust badges בשורה אחת מתחת.
- הזזת רכיבים משניים (טסטמוניאלס, שירותים נוספים) למטה עם ריווח נדיב.

## גל 5 - Wizard של הזמנה
- Progress bar חי בראש הדף עם step names וגליל עדין.
- אנימציית `fade-in`+`slide` בין שלבים.
- Hover states עשירים על כרטיסי מכשיר/תיקון (scale + shadow lift + border primary).
- Feedback מיידי בלחיצה (`active:scale-[0.98]`, ripple עדין).

## גל 6 - מסך מעקב טכנאי
- טיימר ETA ענק במרכז (60px+), בסגנון Wolt.
- אנימציית קסדה משופרת: תנועה חלקה על ציר, רקע כביש נע, גלגלים מסתובבים.
- StatusTimeline מודגש יותר עם step פעיל מודגש (glow + pulse).
- StickyHeader עם glassmorphism עדין וכפתור התקשרות בולט.

## גל 7 - קונסיסטנטיות ופוליש כללי
- מעבר כללי: כל הכפתורים לאותו variant system, כל הכרטיסים ל-`wolt-card`/`strategly-card`.
- וידוא spacing אחיד (p-4/p-6, gap-4).
- אנימציית עמוד `animate-fade-in` בכניסה לכל route.
- מעברי hover אחידים (`transition-all duration-200`).

## פרטים טכניים

**קבצים עיקריים לעדכון:**
- `src/index.css` + `tailwind.config.ts` - טוקנים ואנימציות
- `src/pages/Index.tsx` - Hero חדש
- `src/pages/NewRepairOrder.tsx` - Wizard משופר
- `src/pages/CustomerTracker.tsx` + `src/components/TechnicianTracker.tsx` + `StickyHeader.tsx` - מסך מעקב
- `src/components/Header.tsx` - קונסיסטנטיות
- קומפוננטות כרטיסים: `ModelPicker`, `OrderSummary`, `StatusTimeline`

**אילוצים שנשמרים:**
- RTL מלא, ללא אמוג'ים, ללא צהוב, ללא glassmorphism כבד (לפי memory).
- שמירה על Apple-minimal aesthetic הקיים.
- ללא שינוי לוגיקה עסקית - רק frontend/presentation.
- שמירה על Rubik font + font-size 22px base.

**אישור לפני התחלה:** אבצע גל אחר גל, אעצור אחרי גל 3 ואחרי גל 5 כדי שתוכל לראות ולתת פידבק לפני שממשיכים.
