import { Instagram, Heart, MessageCircle, ExternalLink } from "lucide-react";
import insta1 from "@/assets/instagram-1.jpg";
import insta2 from "@/assets/instagram-2.jpg";
import insta3 from "@/assets/instagram-3.jpg";
import insta4 from "@/assets/instagram-4.jpg";

const INSTAGRAM_URL = "https://www.instagram.com/directfixisrael1/";

const posts = [
  {
    img: insta1,
    caption: "החלפת מסך אייפון 15 Pro בבית הלקוח",
    likes: 142,
    comments: 18,
  },
  {
    img: insta2,
    caption: "מסך שבור? אנחנו מגיעים אליך תוך שעה",
    likes: 98,
    comments: 12,
  },
  {
    img: insta3,
    caption: "החלפת סוללה מקורית עם אחריות 12 חודשים",
    likes: 215,
    comments: 31,
  },
  {
    img: insta4,
    caption: "לקוח מרוצה אחרי תיקון בבית - זה מה שאנחנו עושים",
    likes: 187,
    comments: 24,
  },
];

const InstagramFeed = () => {
  return (
    <section className="section-cream border-b-2 border-foreground/10">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 border-2 border-foreground/10">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-base font-extrabold leading-tight">@directfixisrael1</p>
              <p className="text-xs text-muted-foreground leading-tight">עקבו אחרינו באינסטגרם</p>
            </div>
          </div>
          <h2 className="text-2xl font-extrabold mb-1">
            <span className="text-foreground">DirectFix </span>
            <span className="bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">באינסטגרם</span>
          </h2>
          <p className="text-muted-foreground text-base">תיקונים, טיפים ומאחורי הקלעים</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
          {posts.map((post, i) => (
            <a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-foreground/10 shadow-[3px_3px_0_0_hsl(var(--foreground)/0.08)] hover:shadow-[5px_5px_0_0_hsl(var(--foreground)/0.12)] hover:-translate-y-0.5 transition-all duration-200"
              aria-label={`פוסט באינסטגרם: ${post.caption}`}
            >
              <img
                src={post.img}
                alt={post.caption}
                loading="lazy"
                width={512}
                height={512}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    {post.comments}
                  </span>
                </div>
              </div>
              {/* Always-visible Instagram badge */}
              <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center opacity-95 group-hover:opacity-0 transition-opacity">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
            </a>
          ))}
        </div>

        {/* CTA Follow Button */}
        <div className="mt-5 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-base text-white bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 border-2 border-foreground/10 shadow-[4px_4px_0_0_hsl(var(--foreground)/0.1)] hover:shadow-[6px_6px_0_0_hsl(var(--foreground)/0.12)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <Instagram className="w-5 h-5" />
            <span>עקבו אחרינו</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
