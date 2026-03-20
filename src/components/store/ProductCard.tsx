import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import type { StoreProduct } from '@/store/storeData';
import { toast } from 'sonner';

const ProductCard = ({ product }: { product: StoreProduct }) => {
  const navigate = useNavigate();
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} נוסף לסל`);
  };

  return (
    <Card
      className="group relative overflow-hidden cursor-pointer border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1"
      onClick={() => navigate(`/store/product/${product.id}`)}
    >
      {product.badge && (
        <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground text-xs shadow-lg">
          {product.badge}
        </Badge>
      )}

      <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/60 p-6 flex items-center justify-center overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
      </div>

      <div className="p-4 space-y-2" dir="rtl">
        <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <p className="text-lg font-extrabold text-foreground">
              ₪{product.price.toLocaleString()}
            </p>
            {product.pointsPrice && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                או {product.pointsPrice} נקודות
              </p>
            )}
          </div>
          <Button
            size="sm"
            className="h-9 w-9 p-0 rounded-full shadow-md"
            onClick={handleAdd}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
