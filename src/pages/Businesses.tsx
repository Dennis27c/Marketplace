import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  CheckCircle,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Business } from '@/data/mockData';

export default function Businesses() {
  const { 
    businesses, 
    activeBusiness, 
    setActiveBusiness, 
    addBusiness, 
    updateBusiness, 
    deleteBusiness,
    getProductsByBusiness 
  } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: ''
  });

  const handleOpenDialog = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        logo: business.logo,
        description: business.description
      });
    } else {
      setEditingBusiness(null);
      setFormData({ name: '', logo: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBusiness) {
      updateBusiness(editingBusiness.id, formData);
    } else {
      addBusiness(formData);
    }
    setIsDialogOpen(false);
    setFormData({ name: '', logo: '', description: '' });
    setEditingBusiness(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBusiness(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout 
      title="Negocios" 
      subtitle="Gestiona todos tus negocios registrados"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {businesses.length} negocio{businesses.length !== 1 ? 's' : ''} registrado{businesses.length !== 1 ? 's' : ''}
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Negocio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingBusiness ? 'Editar Negocio' : 'Nuevo Negocio'}
                </DialogTitle>
                <DialogDescription>
                  {editingBusiness 
                    ? 'Modifica la información de tu negocio'
                    : 'Completa los datos para registrar un nuevo negocio'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del negocio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mi Tienda"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">URL del logo</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe tu negocio..."
                    rows={3}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBusiness ? 'Guardar Cambios' : 'Crear Negocio'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Business Grid */}
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => {
            const productCount = getProductsByBusiness(business.id).length;
            const isActive = activeBusiness?.id === business.id;

            return (
              <div
                key={business.id}
                className={cn(
                  "bg-card rounded-xl border-2 p-6 card-hover animate-fade-in relative",
                  isActive ? "border-primary" : "border-border"
                )}
              >
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Activo
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <img 
                    src={business.logo} 
                    alt={business.name}
                    className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate pr-16">
                      {business.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {business.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {productCount} producto{productCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                  {!isActive && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setActiveBusiness(business)}
                    >
                      Seleccionar
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDialog(business)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteId(business.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="Sin negocios"
          description="Aún no has registrado ningún negocio. Comienza creando uno nuevo."
          action={
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Negocio
            </Button>
          }
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los productos asociados a este negocio.
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
