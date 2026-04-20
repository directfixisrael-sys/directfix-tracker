import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoreHeader from '@/components/store/StoreHeader';
import StoreLogin from '@/components/store/StoreLogin';
import ProductCard from '@/components/store/ProductCard';
import { storeProducts, storeCategories } from '@/store/storeData';
import heroBanner from '@/assets/store-hero-banner.jpg';
import iphonesBanner from '@/assets/store-iphones-banner.jpg';
import accessoriesBanner from '@/assets/store-accessories-banner.jpg';
import SEO from "@/components/SEO";
import { seo } from "@/lib/seoData";

const StorePage = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<{ phone: string; name: string; points: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('store_auth');
    if (saved) setAuth(JSON.parse(saved));
  }, []);

  const handleLogin = (phone: string, name: string, points: number) => {
    const data = { phone, name, points };
    setAuth(data);
    localStorage.setItem('store_auth', JSON.stringify(data));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('store_auth');
  };

  if (!auth) return <StoreLogin onLogin={handleLogin} />;

  const featured = storeProducts.filter(p => p.badge).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <SEO {...seo.store} />
      <StoreHeader customerName={auth.name} points={auth.points} onLogout={handleLogout} />

      {/* Hero */}
      <section className="relative h-[420px] overflow-hidden">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-8 md:p-16 text-white" dir="rtl">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-sm mb-4 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>הטבות בלעדיות לחברי מועדון</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3" style={{ fontFamily: "'Rubik', sans-serif" }}>
              חנות ההטבות של directfix
            </h1>
            <p className="text-white/70 max-w-lg text-lg">
              מכשירים, אביזרים והטבות — במחירים מיוחדים לחברי המועדון בלבד
            </p>
          </div>
        </div>
      </section>

      {/* Categories Carousel */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {storeCategories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/store/category/${cat.slug}`)}
              className="bg-card hover:bg-accent/10 border border-border/50 rounded-2xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
            >
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Category Banners */}
      <section className="max-w-7xl mx-auto px-4 mt-10 grid md:grid-cols-2 gap-4" dir="rtl">
        <button
          onClick={() => navigate('/store/category/iphones')}
          className="relative h-48 rounded-2xl overflow-hidden group"
        >
          <img src={iphonesBanner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-end p-8">
            <div className="text-right text-white">
              <h3 className="text-2xl font-extrabold mb-1">אייפונים</h3>
              <p className="text-sm text-white/70">iPhone 15 · 16 · 17</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-white/80 group-hover:text-white transition-colors">
                <span>לצפייה</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate('/store/category/cases')}
          className="relative h-48 rounded-2xl overflow-hidden group"
        >
          <img src={accessoriesBanner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-end p-8">
            <div className="text-right text-white">
              <h3 className="text-2xl font-extrabold mb-1">אביזרים</h3>
              <p className="text-sm text-white/70">כיסויים · מגנים · מטענים</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-white/80 group-hover:text-white transition-colors">
                <span>לצפייה</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-foreground">מוצרים מומלצים</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/store/category/iphones')}>
            הכל
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* All Products Preview */}
      <section className="max-w-7xl mx-auto px-4 pb-16" dir="rtl">
        <h2 className="text-2xl font-extrabold text-foreground mb-6">כל המוצרים</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {storeProducts.slice(0, 12).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {storeProducts.length > 12 && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => navigate('/store/category/iphones')}>
              לכל המוצרים
            </Button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-8" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DirectFix — חנות ההטבות לחברי מועדון
          </p>
          <Button variant="link" size="sm" className="text-muted-foreground" onClick={() => window.location.href = '/'}>
            חזרה לאתר הראשי
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default StorePage;
