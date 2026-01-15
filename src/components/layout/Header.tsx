import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Menu, Bell, User, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { 
    setSidebarOpen, 
    logout, 
    activeBusiness, 
    products, 
    businesses,
    notifications: dbNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications
  } = useApp();
  
  // Estado para notificaciones estáticas vistas (persistido en localStorage)
  // Guardamos un hash de los datos para detectar cuando cambian
  const [viewedStaticNotifications, setViewedStaticNotifications] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('viewedStaticNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Generar hash de los datos actuales para detectar cambios
  const staticNotificationsHash = useMemo(() => {
    if (!activeBusiness) return '';
    const businessProducts = products.filter(p => p.businessId === activeBusiness.id);
    const recentProducts = businessProducts.filter(p => {
      const createdAt = new Date(p.createdAt);
      const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length;
    const soldProducts = businessProducts.filter(p => p.status === 'sold').length;
    return `${activeBusiness.id}-recent:${recentProducts}-sold:${soldProducts}`;
  }, [activeBusiness, products]);
  
  // Limpiar notificaciones vistas cuando cambian los datos
  useEffect(() => {
    const lastHash = localStorage.getItem('lastStaticNotificationsHash');
    if (lastHash && lastHash !== staticNotificationsHash) {
      // Los datos cambiaron, limpiar notificaciones vistas para que aparezcan de nuevo
      setViewedStaticNotifications(new Set());
      localStorage.removeItem('viewedStaticNotifications');
    }
    localStorage.setItem('lastStaticNotificationsHash', staticNotificationsHash);
  }, [staticNotificationsHash]);

  // Calcular notificaciones estáticas (solo las no vistas)
  const staticNotifications = useMemo(() => {
    const notifs: Array<{
      id: string;
      type: 'info' | 'success' | 'warning';
      title: string;
      message: string;
      link?: string;
      icon: React.ReactNode;
    }> = [];

    if (!activeBusiness) {
      return notifs;
    }

    const businessProducts = products.filter(p => p.businessId === activeBusiness.id);
    const recentProducts = businessProducts
      .filter(p => {
        const createdAt = new Date(p.createdAt);
        const daysAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo <= 7;
      })
      .length;

    const soldProducts = businessProducts.filter(p => p.status === 'sold').length;
    const availableProducts = businessProducts.filter(p => p.status === 'available').length;
    const notPostedProducts = businessProducts.filter(p => !p.postedToMarketplace && p.status === 'available').length;

    // Notificación de productos recientes (solo si no ha sido vista)
    if (recentProducts > 0 && !viewedStaticNotifications.has('recent-products')) {
      notifs.push({
        id: 'recent-products',
        type: 'info',
        title: 'Productos recientes',
        message: `${recentProducts} producto${recentProducts !== 1 ? 's' : ''} agregado${recentProducts !== 1 ? 's' : ''} esta semana`,
        link: '/products',
        icon: <Package className="h-4 w-4" />,
      });
    }

    // Notificación de productos vendidos (solo si no ha sido vista)
    if (soldProducts > 0 && !viewedStaticNotifications.has('sold-products')) {
      notifs.push({
        id: 'sold-products',
        type: 'success',
        title: 'Productos vendidos',
        message: `${soldProducts} producto${soldProducts !== 1 ? 's' : ''} marcado${soldProducts !== 1 ? 's' : ''} como vendido${soldProducts !== 1 ? 's' : ''}`,
        link: '/products',
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    }

    // Notificación de productos no subidos a marketplace (solo si no ha sido vista)
    if (notPostedProducts > 0 && !viewedStaticNotifications.has('not-posted')) {
      notifs.push({
        id: 'not-posted',
        type: 'warning',
        title: 'Pendientes de publicar',
        message: `${notPostedProducts} producto${notPostedProducts !== 1 ? 's' : ''} disponible${notPostedProducts !== 1 ? 's' : ''} sin publicar en Marketplace`,
        link: '/products',
        icon: <AlertCircle className="h-4 w-4" />,
      });
    }

    // Notificación si no hay productos (siempre se muestra si aplica)
    if (businessProducts.length === 0) {
      notifs.push({
        id: 'no-products',
        type: 'info',
        title: 'Sin productos',
        message: 'Comienza agregando tu primer producto',
        link: '/products/new',
        icon: <Package className="h-4 w-4" />,
      });
    }

    return notifs;
  }, [activeBusiness, products, viewedStaticNotifications]);

  // Combinar notificaciones estáticas con notificaciones de la BD
  const allNotifications = useMemo(() => {
    const staticNotifs = staticNotifications.map(notif => ({
      ...notif,
      timestamp: 0, // Las estáticas no tienen timestamp
      isRealTime: false,
      read: false
    }));

    const realTimeNotifs = dbNotifications.map(notif => ({
      id: notif.id,
      type: notif.type === 'product_added' ? 'info' as const : 
            notif.type === 'product_sold' ? 'success' as const : 
            notif.type === 'business_added' ? 'info' as const : 'info' as const,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      icon: notif.type === 'product_added' || notif.type === 'business_added' ? <Package className="h-4 w-4" /> :
            notif.type === 'product_sold' ? <CheckCircle2 className="h-4 w-4" /> :
            <AlertCircle className="h-4 w-4" />,
      timestamp: notif.timestamp,
      isRealTime: true,
      read: notif.read
    }));

    // Combinar y ordenar por timestamp (más recientes primero)
    return [...realTimeNotifs, ...staticNotifs].sort((a, b) => {
      if (a.timestamp === 0 && b.timestamp === 0) return 0;
      if (a.timestamp === 0) return 1;
      if (b.timestamp === 0) return -1;
      return b.timestamp - a.timestamp;
    });
  }, [staticNotifications, dbNotifications]);

  // Estado para notificaciones vistas por este dispositivo (localStorage)
  const [viewedNotificationIds, setViewedNotificationIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('viewedNotificationIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Calcular notificaciones no leídas por este dispositivo
  const unreadNotifications = useMemo(() => {
    // Solo contar notificaciones de BD que este dispositivo NO ha visto
    const unread = dbNotifications.filter(n => !viewedNotificationIds.has(n.id));
    return unread;
  }, [dbNotifications, viewedNotificationIds]);

  const unreadCount = unreadNotifications.length;

  // Marcar todas las notificaciones como vistas por este dispositivo cuando se abre el dropdown
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Marcar todas las notificaciones estáticas como vistas (solo si hay)
      const newViewedStatic = new Set(viewedStaticNotifications);
      staticNotifications.forEach(notif => {
        // No marcar "no-products" como vista (debe seguir apareciendo si no hay productos)
        if (notif.id !== 'no-products') {
          newViewedStatic.add(notif.id);
        }
      });
      
      if (newViewedStatic.size !== viewedStaticNotifications.size) {
        setViewedStaticNotifications(newViewedStatic);
        localStorage.setItem('viewedStaticNotifications', JSON.stringify(Array.from(newViewedStatic)));
      }
      
      // Marcar todas las notificaciones de BD como vistas por este dispositivo
      // NO las marcamos en la BD, solo en localStorage de este dispositivo
      const newViewedIds = new Set(viewedNotificationIds);
      dbNotifications.forEach(notif => {
        newViewedIds.add(notif.id);
      });
      
      if (newViewedIds.size !== viewedNotificationIds.size) {
        setViewedNotificationIds(newViewedIds);
        localStorage.setItem('viewedNotificationIds', JSON.stringify(Array.from(newViewedIds)));
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {activeBusiness && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <img 
                src={activeBusiness.logo} 
                alt={activeBusiness.name}
                className="h-6 w-6 rounded object-cover"
              />
              <span className="text-sm font-medium text-foreground">
                {activeBusiness.name}
              </span>
            </div>
          )}
          
          <DropdownMenu onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificaciones</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {dbNotifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllNotifications();
                      }}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allNotifications.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto">
                  {allNotifications.map((notif) => {
                    // Para notificaciones de BD, verificar si este dispositivo las ha visto
                    // Para notificaciones estáticas, usar el estado de lectura
                    const isUnread = (notif as any).isRealTime 
                      ? !viewedNotificationIds.has(notif.id)
                      : !notif.read;
                    const isRealTime = (notif as any).isRealTime;
                    const content = (
                      <div className="flex items-start gap-3 w-full relative">
                        {isUnread && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                        )}
                        <div className={cn(
                          "mt-0.5 flex-shrink-0 ml-4",
                          notif.type === 'success' && "text-green-600",
                          notif.type === 'warning' && "text-yellow-600",
                          notif.type === 'info' && "text-blue-600"
                        )}>
                          {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-sm font-medium",
                              isUnread ? "text-foreground font-semibold" : "text-foreground"
                            )}>
                              {notif.title}
                            </p>
                            {isRealTime && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                Nuevo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                          {isRealTime && (notif as any).timestamp > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date((notif as any).timestamp).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );

                    if (notif.link) {
                      return (
                        <DropdownMenuItem
                          key={notif.id}
                          asChild
                          className={cn(
                            "p-3 cursor-pointer",
                            isUnread && "bg-muted/50",
                            isRealTime && isUnread && "bg-primary/5 border-l-2 border-l-primary",
                            notif.type === 'success' && "hover:bg-green-50 dark:hover:bg-green-950",
                            notif.type === 'warning' && "hover:bg-yellow-50 dark:hover:bg-yellow-950",
                            notif.type === 'info' && "hover:bg-blue-50 dark:hover:bg-blue-950"
                          )}
                        onClick={() => {
                          // Marcar como vista por este dispositivo (solo en localStorage)
                          if (isRealTime && !viewedNotificationIds.has(notif.id)) {
                            const newViewed = new Set(viewedNotificationIds);
                            newViewed.add(notif.id);
                            setViewedNotificationIds(newViewed);
                            localStorage.setItem('viewedNotificationIds', JSON.stringify(Array.from(newViewed)));
                          }
                        }}
                        >
                          <Link to={notif.link}>
                            {content}
                          </Link>
                        </DropdownMenuItem>
                      );
                    }

                    return (
                      <DropdownMenuItem
                        key={notif.id}
                        className={cn(
                          "p-3 cursor-pointer",
                          isUnread && "bg-muted/50",
                          isRealTime && isUnread && "bg-primary/5 border-l-2 border-l-primary",
                          notif.type === 'success' && "hover:bg-green-50 dark:hover:bg-green-950",
                          notif.type === 'warning' && "hover:bg-yellow-50 dark:hover:bg-yellow-950",
                          notif.type === 'info' && "hover:bg-blue-50 dark:hover:bg-blue-950"
                        )}
                        onClick={() => {
                          // Marcar como vista por este dispositivo (solo en localStorage)
                          if (isRealTime && !viewedNotificationIds.has(notif.id)) {
                            const newViewed = new Set(viewedNotificationIds);
                            newViewed.add(notif.id);
                            setViewedNotificationIds(newViewed);
                            localStorage.setItem('viewedNotificationIds', JSON.stringify(Array.from(newViewed)));
                          }
                        }}
                      >
                        {content}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No hay notificaciones</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
