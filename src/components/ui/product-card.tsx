import { Link } from 'react-router-dom';
import { Product } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Eye, Edit, Trash2, CheckCircle2, Facebook } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
  onMarkAsSold?: (id: string) => void;
  onToggleMarketplace?: (id: string) => void;
  showActions?: boolean;
}

const statusConfig = {
  available: { label: 'Disponible', variant: 'success' as const },
  sold: { label: 'Vendido', variant: 'destructive' as const },
  reserved: { label: 'Reservado', variant: 'warning' as const },
};

export function ProductCard({ product, onDelete, onMarkAsSold, onToggleMarketplace, showActions = true }: ProductCardProps) {
  const status = statusConfig[product.status];
  const isSold = product.status === 'sold';

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden card-hover animate-fade-in flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
          <Badge 
            variant={status.variant}
            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
          >
            {status.label}
          </Badge>
          {product.postedToMarketplace && (
            <Badge 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
            >
              <Facebook className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">En Marketplace</span>
              <span className="sm:hidden">MP</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="mt-1 text-sm sm:text-base font-semibold text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-2 text-lg sm:text-xl font-bold text-primary">
          ${product.price.toLocaleString()}
        </p>

        {/* Actions */}
        {showActions && (
          <div className={cn(
            "mt-3 sm:mt-4 space-y-1.5 sm:space-y-2",
            isSold && "mt-auto"
          )}>
            {!isSold && onMarkAsSold && (
              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                onClick={() => onMarkAsSold(product.id)}
              >
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate">Vendido</span>
              </Button>
            )}
            {onToggleMarketplace && (
              <Button 
                variant={product.postedToMarketplace ? "default" : "outline"}
                size="sm" 
                className={cn(
                  "w-full text-xs sm:text-sm",
                  product.postedToMarketplace 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : ""
                )}
                onClick={() => onToggleMarketplace(product.id)}
              >
                <Facebook className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate hidden sm:inline">
                  {product.postedToMarketplace ? 'Marcado como subido' : 'Marcar como subido'}
                </span>
                <span className="truncate sm:hidden">
                  {product.postedToMarketplace ? 'Subido' : 'Subir'}
                </span>
              </Button>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isSold ? (
                <Button asChild variant="outline" size="sm" className="flex-1 text-xs sm:text-sm" disabled>
                  <Link to={`/products/${product.id}`}>
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                    <span className="hidden sm:inline">Ver</span>
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="default" size="sm" className="flex-1 text-xs sm:text-sm">
                    <Link to={`/products/${product.id}`}>
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                      <span className="hidden sm:inline">Ver</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-shrink-0 p-2 sm:p-2.5">
                    <Link to={`/products/${product.id}/edit`}>
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(product.id)}
                  className="flex-shrink-0 p-2 sm:p-2.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
