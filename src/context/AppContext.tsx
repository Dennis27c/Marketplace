import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Business, Product } from '@/data/mockData';
import { toast } from 'sonner';
import { supabase, DatabaseBusiness, DatabaseProduct, DatabaseNotification } from '@/lib/supabase';
import { deleteImage } from '@/lib/storage';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Businesses
  businesses: Business[];
  activeBusiness: Business | null;
  setActiveBusiness: (business: Business | null) => void;
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => void;
  updateBusiness: (id: string, business: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;

  // Products
  products: Product[];
  getProductsByBusiness: (businessId: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Stats
  getTotalProducts: () => number;
  getAvailableProducts: () => number;
  getRecentProducts: (limit?: number) => Product[];

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Real-time notifications (from database)
  notifications: Array<{
    id: string;
    type: 'product_added' | 'product_updated' | 'product_sold' | 'business_added';
    title: string;
    message: string;
    timestamp: number;
    link?: string;
    read: boolean;
  }>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper functions to convert between app types and database types
const dbBusinessToApp = (db: DatabaseBusiness): Business => ({
  id: db.id,
  name: db.name,
  logo: db.logo,
  description: db.description,
  createdAt: db.created_at
});

const appBusinessToDb = (app: Omit<Business, 'id' | 'createdAt'> | Partial<Business>): Partial<DatabaseBusiness> => {
  const result: Partial<DatabaseBusiness> = {};
  if (app.name !== undefined) result.name = app.name;
  if (app.logo !== undefined) result.logo = app.logo;
  if (app.description !== undefined) result.description = app.description;
  return result;
};

const dbProductToApp = (db: DatabaseProduct | any): Product => ({
  id: db.id,
  businessId: db.business_id,
  name: db.name,
  price: db.price,
  category: db.category,
  status: db.status,
  description: db.description,
  image: db.image,
  postedToMarketplace: db.posted_to_marketplace ?? false,
  createdAt: db.created_at
});

const appProductToDb = (app: Omit<Product, 'id' | 'createdAt'> | Partial<Product>): Partial<DatabaseProduct> => {
  const result: Partial<DatabaseProduct> = {};
  if (app.businessId !== undefined) result.business_id = app.businessId;
  if (app.name !== undefined) result.name = app.name;
  if (app.price !== undefined) result.price = app.price;
  if (app.category !== undefined) result.category = app.category;
  if (app.status !== undefined) result.status = app.status;
  if (app.description !== undefined) result.description = app.description;
  if (app.image !== undefined) result.image = app.image;
  if (app.postedToMarketplace !== undefined) result.posted_to_marketplace = app.postedToMarketplace;
  return result;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false); // Cambiar a false para renderizar inmediatamente
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'product_added' | 'product_updated' | 'product_sold' | 'business_added';
    title: string;
    message: string;
    timestamp: number;
    link?: string;
    read: boolean;
  }>>([]);

  // Check for existing session and listen to auth changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Set timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Data loading timeout, continuing with empty data');
          setLoading(false);
        }, 5000); // 5 second timeout
        
        // Load businesses
        const { data: businessesData, error: businessesError } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false });

        if (businessesError) {
          console.error('Error loading businesses:', businessesError);
          // Don't show toast on initial load to avoid spam
          setBusinesses([]);
        } else {
          const loadedBusinesses = businessesData?.map(dbBusinessToApp) || [];
          setBusinesses(loadedBusinesses);
          
          // Set active business
          const savedId = localStorage.getItem('activeBusinessId');
          if (savedId && loadedBusinesses.length > 0) {
            const found = loadedBusinesses.find(b => b.id === savedId);
            setActiveBusinessState(found || loadedBusinesses[0] || null);
          } else if (loadedBusinesses.length > 0) {
            setActiveBusinessState(loadedBusinesses[0]);
          } else {
            setActiveBusinessState(null);
          }
        }

        // Load products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error loading products:', productsError);
          // Don't show toast on initial load to avoid spam
          setProducts([]);
        } else {
          try {
            const loadedProducts = productsData?.map((db: any) => dbProductToApp(db)) || [];
            setProducts(loadedProducts);
          } catch (mapError) {
            console.error('Error mapping products:', mapError);
            setProducts([]);
          }
        }

        // Load notifications
        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (notificationsError) {
          console.error('Error loading notifications:', notificationsError);
          setNotifications([]);
        } else {
          const loadedNotifications = (notificationsData || []).map((db: DatabaseNotification) => ({
            id: db.id,
            type: db.type,
            title: db.title,
            message: db.message,
            link: db.link || undefined,
            timestamp: new Date(db.created_at).getTime(),
            read: db.read
          }));
          setNotifications(loadedNotifications);
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error loading data:', error);
        setBusinesses([]);
        setProducts([]);
        setActiveBusinessState(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time subscriptions (with error handling)
    let businessesChannel: any = null;
    let productsChannel: any = null;
    let notificationsChannel: any = null;
    
    try {
      businessesChannel = supabase
        .channel('businesses-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'businesses'
          },
          (payload) => {
            console.log('Business change received:', payload);
            
            try {
            if (payload.eventType === 'INSERT') {
              const newBusiness = dbBusinessToApp(payload.new as DatabaseBusiness);
              setBusinesses(prev => {
                // Avoid duplicates
                if (prev.find(b => b.id === newBusiness.id)) {
                  return prev;
                }
                return [newBusiness, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
                const updatedBusiness = dbBusinessToApp(payload.new as DatabaseBusiness);
                setBusinesses(prev => prev.map(b => 
                  b.id === updatedBusiness.id ? updatedBusiness : b
                ));
                // Update active business if it was updated
                setActiveBusinessState(prev => 
                  prev?.id === updatedBusiness.id ? updatedBusiness : prev
                );
              } else if (payload.eventType === 'DELETE') {
                const deletedId = payload.old.id;
                setBusinesses(prev => prev.filter(b => b.id !== deletedId));
                setActiveBusinessState(prev => 
                  prev?.id === deletedId ? null : prev
                );
              }
            } catch (error) {
              console.error('Error processing business change:', error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Businesses channel subscribed');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('Businesses channel error, continuing without real-time updates');
          }
        });

      productsChannel = supabase
        .channel('products-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'products'
          },
          (payload) => {
            console.log('Product change received:', payload);
            
            try {
              if (payload.eventType === 'INSERT') {
                const newProduct = dbProductToApp(payload.new as any);
                setProducts(prev => {
                  // Avoid duplicates
                  if (prev.find(p => p.id === newProduct.id)) {
                    return prev;
                  }
                  return [newProduct, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updatedProduct = dbProductToApp(payload.new as any);
                setProducts(prev => prev.map(p => 
                  p.id === updatedProduct.id ? updatedProduct : p
                ));
              } else if (payload.eventType === 'DELETE') {
                const deletedId = payload.old.id;
                setProducts(prev => prev.filter(p => p.id !== deletedId));
              }
            } catch (error) {
              console.error('Error processing product change:', error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Products channel subscribed');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('Products channel error, continuing without real-time updates');
          }
        });

      // Subscribe to notifications changes
      notificationsChannel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('Notification change received:', payload);
            
            try {
              if (payload.eventType === 'INSERT') {
                const newNotif = payload.new as DatabaseNotification;
                const notification = {
                  id: newNotif.id,
                  type: newNotif.type,
                  title: newNotif.title,
                  message: newNotif.message,
                  link: newNotif.link || undefined,
                  timestamp: new Date(newNotif.created_at).getTime(),
                  read: newNotif.read
                };
                
                setNotifications(prev => {
                  // Avoid duplicates
                  if (prev.find(n => n.id === notification.id)) {
                    return prev;
                  }
                  return [notification, ...prev].slice(0, 100);
                });
                
                // Show toast for new notifications
                if (!newNotif.read) {
                  toast.info(newNotif.title, {
                    description: newNotif.message,
                    duration: 4000,
                  });
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedNotif = payload.new as DatabaseNotification;
                setNotifications(prev => prev.map(n => 
                  n.id === updatedNotif.id ? {
                    ...n,
                    read: updatedNotif.read
                  } : n
                ));
              } else if (payload.eventType === 'DELETE') {
                const deletedId = payload.old.id;
                setNotifications(prev => prev.filter(n => n.id !== deletedId));
              }
            } catch (error) {
              console.error('Error processing notification change:', error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Notifications channel subscribed');
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('Notifications channel error, continuing without real-time updates');
          }
        });
    } catch (error) {
      console.warn('Error setting up real-time subscriptions:', error);
      // Continue without real-time updates
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (businessesChannel) {
        supabase.removeChannel(businessesChannel);
      }
      if (productsChannel) {
        supabase.removeChannel(productsChannel);
      }
      if (notificationsChannel) {
        supabase.removeChannel(notificationsChannel);
      }
    };
  }, []);

  // Persist active business
  useEffect(() => {
    if (activeBusiness) {
      localStorage.setItem('activeBusinessId', activeBusiness.id);
    }
  }, [activeBusiness]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error de autenticación:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setIsAuthenticated(true);
        toast.success('Bienvenido al sistema');
        return { success: true };
      }

      return { success: false, error: 'No se pudo iniciar sesión' };
    } catch (error: any) {
      console.error('Error inesperado en login:', error);
      return { success: false, error: error.message || 'Error inesperado al iniciar sesión' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
        toast.error('Error al cerrar sesión');
      } else {
        setIsAuthenticated(false);
        toast.info('Sesión cerrada correctamente');
      }
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const setActiveBusiness = (business: Business | null) => {
    setActiveBusinessState(business);
    if (business) {
      toast.success(`Negocio activo: ${business.name}`);
    }
  };

  const addBusiness = async (businessData: Omit<Business, 'id' | 'createdAt'>) => {
    try {
      const newId = Date.now().toString();
      const createdAt = new Date().toISOString().split('T')[0];
      const dbData: DatabaseBusiness = {
        id: newId,
        name: businessData.name,
        logo: businessData.logo,
        description: businessData.description,
        created_at: createdAt
      };

      const { data, error } = await supabase
        .from('businesses')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating business:', error);
        toast.error('Error al crear el negocio');
        return;
      }

      const newBusiness = dbBusinessToApp(data);
      setBusinesses(prev => [...prev, newBusiness]);
      toast.success('Negocio creado exitosamente');
    } catch (error) {
      console.error('Error creating business:', error);
      toast.error('Error al crear el negocio');
    }
  };

  const updateBusiness = async (id: string, businessData: Partial<Business>) => {
    try {
      const dbData = appBusinessToDb(businessData);
      
      const { error } = await supabase
        .from('businesses')
        .update(dbData)
        .eq('id', id);

      if (error) {
        console.error('Error updating business:', error);
        toast.error('Error al actualizar el negocio');
        return;
      }

      const updatedBusiness = { ...businesses.find(b => b.id === id)!, ...businessData };
      setBusinesses(prev => prev.map(b => 
        b.id === id ? updatedBusiness : b
      ));
      if (activeBusiness?.id === id) {
        setActiveBusinessState(updatedBusiness);
      }
      toast.success('Negocio actualizado');
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Error al actualizar el negocio');
    }
  };

  const deleteBusiness = async (id: string) => {
    try {
      // Get business to delete its logo
      const businessToDelete = businesses.find(b => b.id === id);
      
      // Delete related products first (and their images)
      const productsToDelete = products.filter(p => p.businessId === id);
      
      // Delete images of all products
      for (const product of productsToDelete) {
        if (product.image) {
          await deleteImage(product.image);
        }
      }

      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('business_id', id);

      if (productsError) {
        console.error('Error deleting products:', productsError);
      }

      // Delete business logo from Storage
      if (businessToDelete?.logo) {
        await deleteImage(businessToDelete.logo);
      }

      // Delete business
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting business:', error);
        toast.error('Error al eliminar el negocio');
        return;
      }

      setBusinesses(prev => prev.filter(b => b.id !== id));
      setProducts(prev => prev.filter(p => p.businessId !== id));
      if (activeBusiness?.id === id) {
        const remaining = businesses.filter(b => b.id !== id);
        setActiveBusinessState(remaining[0] || null);
      }
      toast.success('Negocio eliminado');
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Error al eliminar el negocio');
    }
  };

  const getProductsByBusiness = (businessId: string) => {
    return products.filter(p => p.businessId === businessId);
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newId = Date.now().toString();
      const createdAt = new Date().toISOString().split('T')[0];
      const dbData: DatabaseProduct = {
        id: newId,
        business_id: productData.businessId,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        status: productData.status,
        description: productData.description,
        image: productData.image,
        posted_to_marketplace: productData.postedToMarketplace ?? false,
        created_at: createdAt
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        toast.error('Error al crear el producto');
        return;
      }

      const newProduct = dbProductToApp(data);
      setProducts(prev => [...prev, newProduct]);
      toast.success('Producto agregado exitosamente');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const dbData = appProductToDb(productData);
      
      const { error } = await supabase
        .from('products')
        .update(dbData)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        toast.error('Error al actualizar el producto');
        return;
      }

      const updatedProduct = { ...products.find(p => p.id === id)!, ...productData };
      setProducts(prev => prev.map(p => 
        p.id === id ? updatedProduct : p
      ));
      toast.success('Producto actualizado');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Get product to delete its image
      const productToDelete = products.find(p => p.id === id);
      
      // Delete product image from Storage
      if (productToDelete?.image) {
        await deleteImage(productToDelete.image);
      }

      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Error al eliminar el producto');
        return;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const getTotalProducts = () => products.length;
  
  const getAvailableProducts = () => 
    products.filter(p => p.status === 'available').length;
  
  const getRecentProducts = (limit = 5) => 
    [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Update local state anyway
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
      } else {
        // State will be updated by real-time subscription
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update local state anyway
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        // Update local state anyway
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } else {
        // State will be updated by real-time subscription
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Update local state anyway
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        // Remove from local state anyway
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        // State will be updated by real-time subscription
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Remove from local state anyway
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', ''); // Delete all

      if (error) {
        console.error('Error clearing all notifications:', error);
        // Clear local state anyway
        setNotifications([]);
      } else {
        // State will be updated by real-time subscription
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      // Clear local state anyway
      setNotifications([]);
    }
  };

  // No bloquear la renderización - cargar datos en segundo plano
  // La aplicación se renderizará inmediatamente y los datos se cargarán después

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      businesses,
      activeBusiness,
      setActiveBusiness,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      products,
      getProductsByBusiness,
      getProductById,
      addProduct,
      updateProduct,
      deleteProduct,
      getTotalProducts,
      getAvailableProducts,
      getRecentProducts,
      sidebarOpen,
      setSidebarOpen,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
