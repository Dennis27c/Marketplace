import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/ui/product-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
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
import { Plus, Package, Search, Filter, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function Products() {
  const { activeBusiness, getProductsByBusiness, deleteProduct, updateProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 20;

  const allProducts = activeBusiness 
    ? getProductsByBusiness(activeBusiness.id) 
    : [];

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesMarketplace = marketplaceFilter === 'all' || 
        (marketplaceFilter === 'posted' && product.postedToMarketplace) ||
        (marketplaceFilter === 'not-posted' && !product.postedToMarketplace);
      
      return matchesSearch && matchesCategory && matchesStatus && matchesMarketplace;
    });
  }, [allProducts, searchTerm, categoryFilter, statusFilter, marketplaceFilter]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, marketplaceFilter]);

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
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar primera página
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }
      
      // Mostrar páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      
      // Mostrar última página
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

  const handleMarkAsSold = async (id: string) => {
    await updateProduct(id, { status: 'sold' });
  };

  const handleToggleMarketplace = async (id: string) => {
    const product = allProducts.find(p => p.id === id);
    if (product) {
      await updateProduct(id, { postedToMarketplace: !product.postedToMarketplace });
    }
  };

  if (!activeBusiness) {
    return (
      <MainLayout title="Productos">
        <EmptyState
          icon={Package}
          title="Selecciona un negocio"
          description="Debes seleccionar un negocio activo para ver sus productos."
          action={
            <Button asChild>
              <Link to="/businesses">Ver Negocios</Link>
            </Button>
          }
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Productos" 
      subtitle={`Productos de ${activeBusiness.name}`}
    >
      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-3 mb-4 animate-fade-in">
        {/* Desktop: All in one line */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="reserved">Reservado</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
            </SelectContent>
          </Select>

          {/* Marketplace Filter */}
          <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Marketplace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="posted">Subidos a Marketplace</SelectItem>
              <SelectItem value="not-posted">No subidos</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Button */}
          <Button asChild size="sm">
            <Link to="/products/new">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Nuevo
            </Link>
          </Button>
        </div>

        {/* Mobile: Collapsible layout */}
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="lg:hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button asChild size="sm">
              <Link to="/products/new">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                {(categoryFilter !== 'all' || statusFilter !== 'all' || marketplaceFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-1">
                    {[
                      categoryFilter !== 'all' ? 1 : 0,
                      statusFilter !== 'all' ? 1 : 0,
                      marketplaceFilter !== 'all' ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          {/* Mobile: Collapsible filters */}
          <CollapsibleContent className="lg:hidden mt-3 space-y-3">
            <div className="space-y-3 pt-3 border-t border-border">
              {/* Category Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Categoría
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Estado
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Marketplace Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Marketplace
                </label>
                <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="posted">Subidos a Marketplace</SelectItem>
                    <SelectItem value="not-posted">No subidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(categoryFilter !== 'all' || statusFilter !== 'all' || marketplaceFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setMarketplaceFilter('all');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          Mostrando {paginatedProducts.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          {filteredProducts.length !== allProducts.length && (
            <span className="ml-1">
              (de {allProducts.length} total{allProducts.length !== 1 ? 'es' : ''})
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Página {currentPage} de {totalPages}
        </p>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {paginatedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={setDeleteId}
                onMarkAsSold={handleMarkAsSold}
                onToggleMarketplace={handleToggleMarketplace}
              />
            ))}
          </div>
          
          {/* Pagination - Always visible */}
          <div className="mt-4">
            <Pagination>
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      size="default"
                      className={cn(
                        currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                        'gap-1.5 px-3 sm:px-4'
                      )}
                    >
                      <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline whitespace-nowrap">Anterior</span>
                      <span className="sm:hidden whitespace-nowrap">Ant</span>
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
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          isActive={currentPage === pageNum}
                          size="icon"
                          className="cursor-pointer min-w-[2.5rem]"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      size="default"
                      className={cn(
                        currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer',
                        'gap-1.5 px-3 sm:px-4'
                      )}
                    >
                      <span className="hidden sm:inline whitespace-nowrap">Siguiente</span>
                      <span className="sm:hidden whitespace-nowrap">Sig</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
        </>
      ) : allProducts.length > 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron productos con los filtros aplicados."
          action={
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setMarketplaceFilter('all');
            }}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Package}
          title="Sin productos"
          description="Este negocio aún no tiene productos. Comienza agregando uno nuevo."
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent onEscapeKeyDown={() => setDeleteId(null)}>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
