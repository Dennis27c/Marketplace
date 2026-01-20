import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Edit, Trash2, CheckCircle2, Facebook } from 'lucide-react';
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
  const navigate = useNavigate();

  const handleActionClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleEditClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.id}/edit`);
  };

  return (
    <Link 
      to={`/products/${product.id}`}
      className="group bg-card rounded-xl border border-border overflow-hidden card-hover animate-fade-in flex flex-col cursor-pointer transition-all hover:shadow-md active:scale-[0.98] touch-manipulation"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 items-end">
          <Badge 
            variant={status.variant}
            className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 w-fit"
          >
            {status.label}
          </Badge>
          {product.postedToMarketplace && (
            <Badge 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 w-fit"
            >
              <Facebook className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">En Marketplace</span>
              <span className="sm:hidden">MP</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <div className="flex-shrink-0">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {product.category}
          </p>
          <h3 className="mt-0.5 sm:mt-1 text-xs sm:text-base font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 sm:mt-2 text-base sm:text-xl font-bold text-primary">
            ${product.price.toLocaleString()}
          </p>
        </div>

        {/* Spacer for sold products */}
        {isSold && showActions && <div className="flex-1" />}

        {/* Actions */}
        {showActions && (
          <div 
            className={cn(
              "mt-2 sm:mt-4 space-y-1.5 sm:space-y-2",
              isSold && "mt-0"
            )}
            onClick={handleActionClick}
            onTouchStart={handleActionClick}
          >
            {onToggleMarketplace && (
              <Button 
                variant={product.postedToMarketplace ? "default" : "outline"}
                size="sm" 
                className={cn(
                  "w-full text-[10px] sm:text-sm h-7 sm:h-9 touch-manipulation px-2 sm:px-4",
                  product.postedToMarketplace 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-blue-600 text-blue-600 !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent hover:!text-blue-600 active:!text-blue-600"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleMarketplace(product.id);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  onToggleMarketplace(product.id);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              >
                <Facebook className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                <span className="truncate hidden sm:inline">
                  {product.postedToMarketplace ? 'Marcado como subido' : 'Marcar como subido'}
                </span>
                <span className="truncate sm:hidden">
                  {product.postedToMarketplace ? 'Subido' : 'Subir'}
                </span>
              </Button>
            )}
            <div className="flex items-center gap-0.5 sm:gap-2">
              {!isSold && onMarkAsSold && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-[10px] sm:text-sm h-7 sm:h-9 touch-manipulation px-2 sm:px-4"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMarkAsSold(product.id);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1.5 flex-shrink-0" />
                  <span className="truncate -ml-1.5 sm:ml-0">Vender</span>
                </Button>
              )}
              {!isSold && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 sm:h-9 touch-manipulation border-gray-300 hover:bg-gray-50 px-2 sm:px-3 min-w-[44px] sm:min-w-0 flex-shrink-0"
                  onClick={handleEditClick}
                  onTouchStart={handleEditClick}
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(product.id);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  className={cn(
                    "h-7 sm:h-9 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground touch-manipulation",
                    isSold ? "flex-1 px-2 sm:px-4" : "px-2 sm:px-3 min-w-[44px] sm:min-w-0 flex-shrink-0"
                  )}
                >
                  <Trash2 className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0",
                    isSold && "mr-1.5"
                  )} />
                  {isSold && (
                    <span className="text-xs sm:text-sm">Eliminar</span>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
