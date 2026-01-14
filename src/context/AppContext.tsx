import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Business, Product, initialBusinesses, initialProducts } from '@/data/mockData';
import { toast } from 'sonner';

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('businesses');
    return saved ? JSON.parse(saved) : initialBusinesses;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [activeBusiness, setActiveBusinessState] = useState<Business | null>(() => {
    const savedId = localStorage.getItem('activeBusinessId');
    if (savedId) {
      const saved = localStorage.getItem('businesses');
      const businessList = saved ? JSON.parse(saved) : initialBusinesses;
      return businessList.find((b: Business) => b.id === savedId) || businessList[0] || null;
    }
    return initialBusinesses[0] || null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Persist data
  useEffect(() => {
    localStorage.setItem('businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeBusiness) {
      localStorage.setItem('activeBusinessId', activeBusiness.id);
    }
  }, [activeBusiness]);

  const login = () => {
    setIsAuthenticated(true);
    toast.success('Bienvenido al sistema');
  };

  const logout = () => {
    setIsAuthenticated(false);
    toast.info('Sesión cerrada correctamente');
  };

  const setActiveBusiness = (business: Business | null) => {
    setActiveBusinessState(business);
    if (business) {
      toast.success(`Negocio activo: ${business.name}`);
    }
  };

  const addBusiness = (businessData: Omit<Business, 'id' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...businessData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBusinesses(prev => [...prev, newBusiness]);
    toast.success('Negocio creado exitosamente');
  };

  const updateBusiness = (id: string, businessData: Partial<Business>) => {
    setBusinesses(prev => prev.map(b => 
      b.id === id ? { ...b, ...businessData } : b
    ));
    if (activeBusiness?.id === id) {
      setActiveBusinessState(prev => prev ? { ...prev, ...businessData } : null);
    }
    toast.success('Negocio actualizado');
  };

  const deleteBusiness = (id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
    setProducts(prev => prev.filter(p => p.businessId !== id));
    if (activeBusiness?.id === id) {
      const remaining = businesses.filter(b => b.id !== id);
      setActiveBusinessState(remaining[0] || null);
    }
    toast.success('Negocio eliminado');
  };

  const getProductsByBusiness = (businessId: string) => {
    return products.filter(p => p.businessId === businessId);
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success('Producto agregado exitosamente');
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...productData } : p
    ));
    toast.success('Producto actualizado');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Producto eliminado');
  };

  const getTotalProducts = () => products.length;
  
  const getAvailableProducts = () => 
    products.filter(p => p.status === 'available').length;
  
  const getRecentProducts = (limit = 5) => 
    [...products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

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
      setSidebarOpen
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
