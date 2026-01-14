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
  TrendingUp,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Negocios"
          value={businesses.length}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Productos"
          value={getTotalProducts()}
          icon={Package}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Disponibles"
          value={getAvailableProducts()}
          icon={CheckCircle}
        />
        <StatCard
          title="Tasa de Ventas"
          value="23%"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button asChild>
          <Link to="/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/businesses">
            <Building2 className="h-4 w-4 mr-2" />
            Gestionar Negocios
          </Link>
        </Button>
      </div>

      {/* Active Business Info */}
      {activeBusiness && (
        <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <img 
              src={activeBusiness.logo} 
              alt={activeBusiness.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Negocio Activo</p>
              <h3 className="text-xl font-semibold text-foreground">{activeBusiness.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{activeBusiness.description}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/products">
                Ver Productos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Recent Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Productos Recientes</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/products">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {recentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Button asChild>
                <Link to="/products/new">
                  <Plus className="h-4 w-4 mr-2" />
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
