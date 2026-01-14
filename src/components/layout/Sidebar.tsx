import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Package,
  Plus,
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Negocios', href: '/businesses', icon: Building2 },
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Nuevo Producto', href: '/products/new', icon: Plus },
];

export function Sidebar() {
  const location = useLocation();
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    logout, 
    businesses, 
    activeBusiness, 
    setActiveBusiness 
  } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
                <Package className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">
                MarketHub
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Business Selector */}
          <div className="px-3 py-4">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Negocio Activo
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors">
                  {activeBusiness ? (
                    <>
                      <img 
                        src={activeBusiness.logo} 
                        alt={activeBusiness.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-left text-sm font-medium text-sidebar-foreground truncate">
                        {activeBusiness.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-sidebar-foreground/70">
                      Seleccionar negocio
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {businesses.map((business) => (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() => setActiveBusiness(business)}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer",
                      activeBusiness?.id === business.id && "bg-muted"
                    )}
                  >
                    <img 
                      src={business.logo} 
                      alt={business.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                    <span className="truncate">{business.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            <p className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Menú Principal
            </p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "sidebar-item",
                    isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={logout}
              className="sidebar-item sidebar-item-inactive w-full text-left"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
