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
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-[55] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[60] h-full w-56 bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between px-3.5 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Package className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">
                MarketHub
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Business Selector */}
          <div className="px-2.5 py-3">
            <p className="px-2.5 text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Negocio Activo
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors text-left">
                  {activeBusiness ? (
                    <>
                      <img 
                        src={activeBusiness.logo} 
                        alt={activeBusiness.name}
                        className="h-7 w-7 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-xs font-medium text-sidebar-foreground truncate">
                        {activeBusiness.name}
                      </span>
                    </>
                  ) : (
                    <span className="flex-1 text-xs text-sidebar-foreground/70">
                      Seleccionar negocio
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/50 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 z-[70]">
                {businesses.map((business) => (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() => setActiveBusiness(business)}
                    className={cn(
                      "flex items-center gap-2.5 cursor-pointer",
                      activeBusiness?.id === business.id && "bg-muted"
                    )}
                  >
                    <img 
                      src={business.logo} 
                      alt={business.name}
                      className="h-5 w-5 rounded object-cover"
                    />
                    <span className="truncate text-xs">{business.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2.5 py-2 space-y-0.5">
            <p className="px-2.5 text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
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
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-xs">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2.5 border-t border-sidebar-border">
            <button
              onClick={logout}
              className="sidebar-item sidebar-item-inactive w-full text-left"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-xs">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
