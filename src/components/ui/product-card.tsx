import { Link } from 'react-router-dom';
import { Product } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  available: { label: 'Disponible', variant: 'success' as const },
  sold: { label: 'Vendido', variant: 'secondary' as const },
  reserved: { label: 'Reservado', variant: 'warning' as const },
};

export function ProductCard({ product, onDelete, showActions = true }: ProductCardProps) {
  const status = statusConfig[product.status];

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden card-hover animate-fade-in">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge 
          variant={status.variant}
          className="absolute top-3 right-3"
        >
          {status.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="mt-1 font-semibold text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-2 text-xl font-bold text-primary">
          ${product.price.toLocaleString()}
        </p>

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex items-center gap-2">
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link to={`/products/${product.id}`}>
                <Eye className="h-4 w-4 mr-1.5" />
                Ver
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/products/${product.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(product.id)}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
