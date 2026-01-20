import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/stat-card';
import { ProductCard } from '@/components/ui/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Package, 
  CheckCircle, 
  Plus,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { 
    businesses, 
    getTotalProducts, 
    getAvailableProducts, 
    getRecentProducts,
    activeBusiness 
  } = useApp();

  const recentProducts = getRecentProducts(4);

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle="Resumen general de tu actividad"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard
          title="Total Negocios"
          value={businesses.length}
          icon={Building2}
        />
        <StatCard
          title="Total Productos"
          value={getTotalProducts()}
          icon={Package}
        />
        <StatCard
          title="Disponibles"
          value={getAvailableProducts()}
          icon={CheckCircle}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button asChild size="sm">
          <Link to="/products/new">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nuevo Producto
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/businesses">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Gestionar Negocios
          </Link>
        </Button>
      </div>

      {/* Active Business Info */}
      {activeBusiness && (
        <div className="bg-card rounded-lg border border-border p-4 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <img 
              src={activeBusiness.logo} 
              alt={activeBusiness.name}
              className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Negocio Activo</p>
              <h3 className="text-base font-semibold text-foreground">{activeBusiness.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{activeBusiness.description}</p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto flex-shrink-0">
              <Link to="/products">
                Ver Productos
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Recent Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Productos Recientes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/products">
              Ver todos
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentProducts.map((product) => (
              <ProductCard key={product.id} product={product} showActions={false} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Sin productos"
            description="Aún no has agregado ningún producto. Comienza creando uno nuevo."
            action={
              <Button asChild size="sm">
                <Link to="/products/new">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Agregar Producto
                </Link>
              </Button>
            }
          />
        )}
      </div>
    </MainLayout>
  );
}
