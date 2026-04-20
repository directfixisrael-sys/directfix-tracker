import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Star, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StoreHeader from '@/components/store/StoreHeader';
import StoreLogin from '@/components/store/StoreLogin';
import ProductCard from '@/components/store/ProductCard';
import { storeProducts } from '@/store/storeData';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import SEO from "@/components/SEO";
import { SITE } from "@/lib/seoData";

const StoreProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(s => s.addItem);
  const [auth, setAuth] = useState<{ phone: string; name: string; points: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

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

  const product = storeProducts.find(p => p.id === id);
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">מוצר לא נמצא</p>
          <Button onClick={() => navigate('/store')}>חזרה לחנות</Button>
        </div>
      </div>
    );
  }

  const related = storeProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, selectedColor);
    toast.success(`${product.name} נוסף לסל הקניות`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product.name} | חנות DirectFix`}
        description={`${product.name} - ${product.description || 'הזמינו עכשיו בחנות DirectFix'}. ${product.price ? `מחיר: ₪${product.price}` : ''}`}
        image={product.image}
        url={`${SITE.origin}/store/product/${product.id}`}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.image,
          offers: {
            "@type": "Offer",
            priceCurrency: "ILS",
            price: String(product.price ?? 0),
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <StoreHeader customerName={auth.name} points={auth.points} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={() => navigate('/store')} className="hover:text-foreground transition-colors">חנות</button>
          <ChevronLeft className="w-3 h-3" />
          <button onClick={() => navigate(`/store/category/${product.category}`)} className="hover:text-foreground transition-colors">
            {product.category === 'iphones' ? 'אייפונים' :
             product.category === 'cases' ? 'כיסויים' :
             product.category === 'chargers' ? 'מטענים' :
             product.category === 'audio' ? 'אוזניות' : 'מגנים'}
          </button>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-gradient-to-br from-muted/30 to-muted/60 rounded-3xl p-12 flex items-center justify-center aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              {product.badge && (
                <Badge className="mb-3 bg-primary text-primary-foreground">{product.badge}</Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-foreground">₪{product.price.toLocaleString()}</span>
              </div>
              {product.pointsPrice && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-xl">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="font-bold">או {product.pointsPrice.toLocaleString()} נקודות</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">צבע</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        selectedColor === color
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            {product.specs && (
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">מפרט</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.specs.map(spec => (
                    <div key={spec} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              הוספה לסל
            </Button>

            {/* Trust */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <Shield className="w-4 h-4" />
              <span>משלוח חינם · אחריות מלאה · החזרה עד 14 יום</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold text-foreground mb-6">מוצרים דומים</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StoreProductPage;
