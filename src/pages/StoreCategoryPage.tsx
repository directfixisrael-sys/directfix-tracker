import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StoreHeader from '@/components/store/StoreHeader';
import StoreLogin from '@/components/store/StoreLogin';
import ProductCard from '@/components/store/ProductCard';
import { storeProducts, storeCategories } from '@/store/storeData';

const StoreCategoryPage = () => {
  const { slug } = useParams();
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

  const category = storeCategories.find(c => c.slug === slug);
  const products = storeProducts.filter(p => p.category === slug);

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader customerName={auth.name} points={auth.points} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate('/store')} className="hover:text-foreground transition-colors">חנות</button>
          <ChevronLeft className="w-3 h-3" />
          <span className="text-foreground font-medium">{category?.name || slug}</span>
        </div>

        <h1 className="text-3xl font-extrabold text-foreground mb-2">{category?.name}</h1>
        <p className="text-muted-foreground mb-8">{products.length} מוצרים</p>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {storeCategories.map(cat => (
            <Button
              key={cat.slug}
              variant={cat.slug === slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate(`/store/category/${cat.slug}`)}
              className="rounded-full"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">אין מוצרים בקטגוריה זו כרגע</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCategoryPage;
