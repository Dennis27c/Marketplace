import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/ui/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, Search, Filter, X, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { categories } from '@/data/mockData';

export default function SoldProducts() {
  const { products, businesses, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [businessFilter, setBusinessFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 20;

  // Obtener todos los productos vendidos de todos los negocios
  const soldProducts = useMemo(() => {
    return products.filter(product => product.status === 'sold');
  }, [products]);

  const filteredProducts = useMemo(() => {
    return soldProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesBusiness = businessFilter === 'all' || product.businessId === businessFilter;
      
      return matchesSearch && matchesCategory && matchesBusiness;
    });
  }, [soldProducts, searchTerm, categoryFilter, businessFilter]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, businessFilter]);

  // Calcular productos paginados
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  const getBusinessName = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    return business?.name || 'Negocio desconocido';
  };

  return (
    <MainLayout 
      title="Productos Vendidos" 
      subtitle="Todos los productos vendidos de todos tus negocios"
    >
      {/* Filtros */}
      <div className="bg-card rounded-lg border border-border p-3 mb-4 sm:mb-6 animate-fade-in">
        {/* Desktop: Filtros siempre visibles en la misma línea */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Filtro Categoría */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-56 h-9 text-sm">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Negocio */}
          <Select value={businessFilter} onValueChange={setBusinessFilter}>
            <SelectTrigger className="w-56 h-9 text-sm">
              <SelectValue placeholder="Negocio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los negocios</SelectItem>
              {businesses.map(business => (
                <SelectItem key={business.id} value={business.id}>
                  {business.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: Filtros colapsables */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="sm:hidden">
          <div className="flex flex-col gap-2">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>

            {/* Botón de filtros */}
            <CollapsibleTrigger asChild>
              <button className="inline-flex items-center justify-center gap-2 px-3 h-9 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                <Filter className="h-4 w-4" />
                Filtros
                {filtersOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {(categoryFilter !== 'all' || businessFilter !== 'all') && '1+'}
                  </Badge>
                )}
              </button>
            </CollapsibleTrigger>
          </div>

          {/* Panel de filtros móvil */}
          <CollapsibleContent className="mt-3 space-y-3">
            <div className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-card">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Categoría</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Negocio</label>
                <Select value={businessFilter} onValueChange={setBusinessFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos los negocios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los negocios</SelectItem>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'producto vendido' : 'productos vendidos'}
          {searchTerm || categoryFilter !== 'all' || businessFilter !== 'all' ? ' (filtrados)' : ''}
        </span>
      </div>

      {/* Lista de productos */}
      {paginatedProducts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={soldProducts.length === 0 ? "No hay productos vendidos" : "No se encontraron productos"}
          description={
            soldProducts.length === 0
              ? "Aún no has vendido ningún producto. Los productos marcados como vendidos aparecerán aquí."
              : "Intenta ajustar los filtros de búsqueda."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {paginatedProducts.map(product => {
              const business = businesses.find(b => b.id === product.businessId);
              return (
                <div key={product.id} className="relative">
                  <ProductCard
                    product={product}
                    onDelete={deleteProduct}
                    showActions={true}
                  />
                  {business && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0.5 bg-background/80 backdrop-blur-sm"
                      >
                        <Building2 className="h-2.5 w-2.5 mr-1" />
                        {business.name}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>

                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    const pageNum = page as number;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "cursor-pointer",
                            currentPage === pageNum && "bg-primary text-primary-foreground"
                          )}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalPages && "pointer-events-none opacity-50"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full p-4 sm:p-6 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
